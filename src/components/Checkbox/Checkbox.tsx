import { useEffect, useId, useRef } from 'react';
import styles from './Checkbox.module.css';

// ─── Checkbox ─────────────────────────────────────────────────────────────────

export interface CheckboxProps {
  /** Visible label text. */
  label: string;
  /** Controlled checked state. */
  checked?: boolean;
  /**
   * Indeterminate state — shown when some (not all) child items are selected.
   * Sets the DOM `indeterminate` property, which maps to `aria-checked="mixed"` in the AT tree.
   */
  indeterminate?: boolean;
  /** Fires with the new checked state on change. */
  onChange?: (checked: boolean) => void;
  /** Hint shown below the label. Linked via `aria-describedby`. */
  hint?: string;
  /** Validation error. Sets `aria-invalid` and populates a polite live region. */
  errorMessage?: string;
  /** Sets `required` and `aria-required`. Visual asterisk is `aria-hidden`. */
  required?: boolean;
  /** Disables the input. */
  disabled?: boolean;
  /** Override the generated `id` — useful when composing within a group. */
  id?: string;
}

export function Checkbox({
  label,
  checked,
  indeterminate = false,
  onChange,
  hint,
  errorMessage,
  required = false,
  disabled = false,
  id: providedId,
}: CheckboxProps) {
  const uid     = useId();
  const inputId = providedId ?? uid;
  const hintId  = `${uid}-hint`;
  const errorId = `${uid}-error`;
  const inputRef = useRef<HTMLInputElement>(null);

  // `indeterminate` is a DOM property — cannot be set via HTML attribute
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const hasError    = Boolean(errorMessage);
  const describedBy = [hint ? hintId : null, hasError ? errorId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className={styles.wrapper}>
      <label
        htmlFor={inputId}
        className={`${styles.label} ${disabled ? styles.labelDisabled : ''}`}
      >
        <input
          ref={inputRef}
          type="checkbox"
          id={inputId}
          checked={checked}
          disabled={disabled}
          required={required}
          aria-required={required ? true : undefined}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={describedBy}
          className={styles.input}
          onChange={(e) => onChange?.(e.target.checked)}
        />
        <span className={styles.labelText}>
          {label}
          {required && <span aria-hidden="true" className={styles.requiredMark}> *</span>}
        </span>
      </label>

      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}

      {hasError && (
        <p id={errorId} className={styles.error}>
          <span aria-hidden="true" className={styles.errorIcon}>⚠</span>
          {errorMessage}
        </p>
      )}

      {/* Polite live region — announces errors without moving focus (4.1.3) */}
      <div role="status" aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {errorMessage ?? ''}
      </div>
    </div>
  );
}

// ─── CheckboxGroup ────────────────────────────────────────────────────────────

export interface CheckboxOption {
  /** The value included in the selected array when this option is checked. */
  value: string;
  /** Visible label text. */
  label: string;
  /** Optional secondary description below the label. */
  hint?: string;
  /** Disables this individual option. */
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  /** `<legend>` text — the accessible name for the whole group. */
  legend: string;
  /** Checkbox options in display order. */
  options: CheckboxOption[];
  /** Controlled array of selected values. */
  value?: string[];
  /** Fires with the updated selected values array on any change. */
  onChange?: (value: string[]) => void;
  /** Group-level hint shown below the legend. Linked via `aria-describedby`. */
  hint?: string;
  /** Validation error. Sets `aria-invalid` on all inputs and populates the live region. */
  errorMessage?: string;
  /** Sets `required` and `aria-required` on all inputs. Visual asterisk is `aria-hidden`. */
  required?: boolean;
  /** Disables all inputs. */
  disabled?: boolean;
  /**
   * Renders a "Select all" checkbox above the options.
   * Checked when all enabled options are selected.
   * Indeterminate (`aria-checked="mixed"`) when some but not all are selected.
   */
  showSelectAll?: boolean;
}

export function CheckboxGroup({
  legend,
  options,
  value = [],
  onChange,
  hint,
  errorMessage,
  required = false,
  disabled = false,
  showSelectAll = false,
}: CheckboxGroupProps) {
  const uid         = useId();
  const hintId      = `${uid}-hint`;
  const errorId     = `${uid}-error`;
  const selectAllId = `${uid}-select-all`;
  const selectAllRef = useRef<HTMLInputElement>(null);

  const hasError    = Boolean(errorMessage);
  const enabledOptions = options.filter((o) => !o.disabled && !disabled);
  const allChecked  = enabledOptions.length > 0 && enabledOptions.every((o) => value.includes(o.value));
  const someChecked = enabledOptions.some((o) => value.includes(o.value));
  const isIndeterminate = someChecked && !allChecked;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = isIndeterminate;
  }, [isIndeterminate]);

  const groupDescribedBy = [hint ? hintId : null, hasError ? errorId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  function handleSelectAll(checked: boolean) {
    onChange?.(checked ? enabledOptions.map((o) => o.value) : []);
  }

  function handleOption(optionValue: string, checked: boolean) {
    onChange?.(
      checked
        ? [...value, optionValue]
        : value.filter((v) => v !== optionValue),
    );
  }

  return (
    <fieldset
      className={`${styles.fieldset} ${disabled ? styles.fieldsetDisabled : ''}`}
    >
      <legend className={styles.legend}>
        {legend}
        {required && <span aria-hidden="true" className={styles.requiredMark}> *</span>}
      </legend>

      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}

      <div className={styles.options}>
        {showSelectAll && (
          <label
            className={`${styles.option} ${styles.selectAll} ${disabled ? styles.optionDisabled : ''}`}
          >
            <input
              ref={selectAllRef}
              type="checkbox"
              id={selectAllId}
              checked={allChecked}
              disabled={disabled}
              className={styles.input}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            <span className={styles.labelContent}>
              <span className={styles.labelText}>Select all</span>
            </span>
          </label>
        )}

        {options.map((option) => {
          const isChecked  = value.includes(option.value);
          const isDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              className={`${styles.option} ${isDisabled ? styles.optionDisabled : ''} ${isChecked ? styles.optionChecked : ''}`}
            >
              <input
                type="checkbox"
                value={option.value}
                checked={isChecked}
                disabled={isDisabled}
                required={required}
                aria-required={required ? true : undefined}
                aria-invalid={hasError ? true : undefined}
                aria-describedby={groupDescribedBy}
                className={styles.input}
                onChange={(e) => handleOption(option.value, e.target.checked)}
              />
              <span className={styles.labelContent}>
                <span className={styles.labelText}>{option.label}</span>
                {option.hint && (
                  <span className={styles.optionHint}>{option.hint}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {hasError && (
        <p id={errorId} className={styles.error}>
          <span aria-hidden="true" className={styles.errorIcon}>⚠</span>
          {errorMessage}
        </p>
      )}

      <div role="status" aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {errorMessage ?? ''}
      </div>
    </fieldset>
  );
}
