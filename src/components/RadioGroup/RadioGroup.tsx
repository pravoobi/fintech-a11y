import { useId } from 'react';
import styles from './RadioGroup.module.css';

export interface RadioOption {
  /** The value submitted with the form. */
  value: string;
  /** Visible label text for this option. */
  label: string;
  /** Optional secondary description shown below the label. */
  hint?: string;
  /** Disables this individual option. */
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** `<legend>` text — the accessible name for the whole group. Required. */
  legend: string;
  /** HTML `name` attribute shared by all radio inputs. Required. */
  name: string;
  /** Radio options in display order. */
  options: RadioOption[];
  /** Controlled selected value. */
  value?: string;
  /** Fires with the newly selected value on change. */
  onChange?: (value: string) => void;
  /** Group-level hint shown below the legend. Linked via `aria-describedby`. */
  hint?: string;
  /** Validation error. Sets `aria-invalid` on all inputs and populates the live region. */
  errorMessage?: string;
  /** Sets `required` and `aria-required` on all inputs. Visual asterisk is `aria-hidden`. */
  required?: boolean;
  /** Disables all inputs. */
  disabled?: boolean;
}

export function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
  hint,
  errorMessage,
  required = false,
  disabled = false,
}: RadioGroupProps) {
  const uid      = useId();
  const hintId   = `${uid}-hint`;
  const errorId  = `${uid}-error`;
  const hasError = Boolean(errorMessage);

  const describedBy = [
    hint        ? hintId  : null,
    hasError    ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <fieldset
      className={`${styles.fieldset} ${disabled ? styles.fieldsetDisabled : ''}`}
    >
      <legend className={styles.legend}>
        {legend}
        {required && (
          <span aria-hidden="true" className={styles.requiredMark}> *</span>
        )}
      </legend>

      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}

      <div className={styles.options}>
        {options.map((option) => {
          const isChecked  = option.value === value;
          const isDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              className={`${styles.option} ${isDisabled ? styles.optionDisabled : ''} ${isChecked ? styles.optionChecked : ''}`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isChecked}
                disabled={isDisabled}
                required={required}
                aria-required={required ? true : undefined}
                aria-invalid={hasError ? true : undefined}
                aria-describedby={describedBy}
                className={styles.input}
                onChange={() => onChange?.(option.value)}
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

      {/* Polite live region — announces errors without moving focus (4.1.3) */}
      <div role="status" aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {errorMessage ?? ''}
      </div>
    </fieldset>
  );
}
