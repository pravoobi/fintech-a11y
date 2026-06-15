import { useId, useRef, useState } from 'react';
import { Modal } from './Modal';
import styles from './ModalForm.module.css';

// ─── Field definition ─────────────────────────────────────────────────────────

export interface ModalFormField {
  /** Unique name used as the form data key. */
  name: string;
  /** Visible label text. */
  label: string;
  type?: 'text' | 'email' | 'tel';
  /** Hint text displayed below the label. */
  hint?: string;
  /** inputmode attribute for mobile keyboards. */
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  /** Sets required + aria-required. Visual asterisk is aria-hidden. */
  required?: boolean;
  maxLength?: number;
  /**
   * Custom validation function. Called on blur and on submit.
   * Return an error string or empty string if valid.
   */
  validate?: (value: string) => string;
}

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface ModalFormProps {
  /** Controls visibility. */
  isOpen: boolean;
  /** Called on Esc, cancel, backdrop click, or after a successful submit. */
  onClose: () => void;
  /** Dialog title — also the accessible name via aria-labelledby. */
  title: string;
  /** Optional subtitle shown below the title (aria-describedby). */
  description?: string;
  /** Ordered list of form fields to render. */
  fields: ModalFormField[];
  /**
   * Called with field data when all validation passes.
   * May return a Promise — the submit button shows a loading state until it resolves.
   */
  onSubmit: (data: Record<string, string>) => void | Promise<void>;
  /** Label for the primary submit button. */
  submitLabel?: string;
  /** Label for the cancel button. */
  cancelLabel?: string;
}

// ─── Internal state ───────────────────────────────────────────────────────────

interface FieldState {
  value: string;
  /** Empty string means no error. */
  error: string;
  touched: boolean;
}

type FormState = Record<string, FieldState>;

function initialState(fields: ModalFormField[]): FormState {
  return Object.fromEntries(
    fields.map((f) => [f.name, { value: '', error: '', touched: false }]),
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ModalForm({
  isOpen,
  onClose,
  title,
  description,
  fields,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
}: ModalFormProps) {
  const uid = useId();
  const fieldId  = (name: string) => `${uid}-${name}`;
  const errorId  = (name: string) => `${uid}-${name}-err`;
  const hintId   = (name: string) => `${uid}-${name}-hint`;
  const summaryId = `${uid}-err-summary`;

  const [formState, setFormState] = useState<FormState>(() => initialState(fields));
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [summaryErrors, setSummaryErrors] = useState<string[]>([]);

  const firstFieldRef   = useRef<HTMLInputElement>(null);
  const errorSummaryRef = useRef<HTMLHeadingElement>(null);

  // ─── Validation ────────────────────────────────────────────────────────────

  function validateField(field: ModalFormField, value: string): string {
    if (field.required && value.trim() === '') {
      return `${field.label} is required.`;
    }
    return field.validate ? field.validate(value) : '';
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleChange(name: string, value: string) {
    setFormState((prev) => ({
      ...prev,
      [name]: { ...prev[name], value },
    }));
  }

  // Use functional updater so `prev` is always the latest committed state,
  // avoiding stale-closure bugs when reading the value after typing.
  function handleBlur(field: ModalFormField) {
    setFormState((prev) => {
      const value = prev[field.name].value;
      const error = validateField(field, value);
      return { ...prev, [field.name]: { ...prev[field.name], error, touched: true } };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Read values from the closure snapshot — safe because fireEvent.change (tests)
    // and React's event system both guarantee formState is committed before submit fires.
    const errors: string[] = [];
    const submitData: Record<string, string> = {};
    const fieldUpdates: FormState = {};

    for (const field of fields) {
      const value = formState[field.name].value;
      const error = validateField(field, value);
      fieldUpdates[field.name] = { value, error, touched: true };
      if (error) errors.push(error);
      submitData[field.name] = value;
    }

    setFormState((prev) => ({ ...prev, ...fieldUpdates }));

    if (errors.length > 0) {
      setSummaryErrors(errors);
      // Move focus to error summary — AT reads heading on focus (3.3.1, 4.1.3)
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setSummaryErrors([]);
    setIsSubmitting(true);
    try {
      await onSubmit(submitData);
      resetAndClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetAndClose() {
    setFormState(initialState(fields));
    setSummaryErrors([]);
    onClose();
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title={title}
      description={description}
      initialFocusRef={firstFieldRef}
    >
      {/* Error summary — only shown after a failed submit attempt.
          Focus moves here so AT announces the count + list without a live region
          (3.3.1 Error Identification, 3.3.3 Error Suggestion). */}
      {summaryErrors.length > 0 && (
        <div
          className={styles.errorSummary}
          aria-labelledby={summaryId}
        >
          <h3
            id={summaryId}
            ref={errorSummaryRef}
            tabIndex={-1}
            className={styles.errorSummaryTitle}
          >
            {summaryErrors.length === 1
              ? 'There is 1 error in this form'
              : `There are ${summaryErrors.length} errors in this form`}
          </h3>
          <ul className={styles.errorSummaryList} aria-label="Form errors">
            {summaryErrors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} aria-label={title}>
        {fields.map((field, index) => {
          const state    = formState[field.name];
          const hasError = state.touched && Boolean(state.error);

          const describedBy = [
            field.hint ? hintId(field.name) : null,
            hasError    ? errorId(field.name)  : null,
          ]
            .filter(Boolean)
            .join(' ') || undefined;

          return (
            <div key={field.name} className={styles.fieldGroup}>
              <label htmlFor={fieldId(field.name)} className={styles.label}>
                {field.label}
                {field.required && (
                  <span aria-hidden="true" className={styles.requiredMark}> *</span>
                )}
              </label>

              {field.hint && (
                <p id={hintId(field.name)} className={styles.hint}>
                  {field.hint}
                </p>
              )}

              <input
                ref={index === 0 ? firstFieldRef : undefined}
                id={fieldId(field.name)}
                type={field.type ?? 'text'}
                inputMode={field.inputMode}
                autoComplete={field.autoComplete ?? 'off'}
                maxLength={field.maxLength}
                required={field.required}
                aria-required={field.required ? true : undefined}
                aria-invalid={hasError ? true : undefined}
                aria-describedby={describedBy}
                value={state.value}
                onChange={(e) => handleChange(field.name, e.target.value)}
                onBlur={() => handleBlur(field)}
                className={`${styles.input}${hasError ? ` ${styles.inputError}` : ''}`}
              />

              {/* Always-present container — text change triggers aria-live (3.3.1) */}
              <p
                id={errorId(field.name)}
                className={styles.fieldError}
                aria-live="polite"
              >
                {hasError && (
                  <>
                    <span aria-hidden="true" className={styles.errorIcon}>⚠</span>
                    {state.error}
                  </>
                )}
              </p>
            </div>
          );
        })}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={resetAndClose}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
            aria-disabled={isSubmitting ? true : undefined}
          >
            {isSubmitting ? 'Submitting…' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
