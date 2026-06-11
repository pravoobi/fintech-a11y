import React, { useId } from 'react';
import styles from './FormField.module.css';

export interface FormFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Visible label — always rendered as a real <label>, never a placeholder substitute. */
  label: string;
  /** Helper text shown below the label, linked to the input via aria-describedby. */
  hint?: string;
  /** Validation error. Triggers aria-invalid on the input and a polite live-region announcement. */
  errorMessage?: string;
}

export function FormField({
  label,
  hint,
  errorMessage,
  required,
  disabled,
  className,
  ...inputProps
}: FormFieldProps) {
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();

  const hasHint = Boolean(hint);
  const hasError = Boolean(errorMessage);

  // Build aria-describedby from whichever supplemental elements are present
  const describedBy =
    [hasHint ? hintId : null, hasError ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`${styles.field}${disabled ? ` ${styles.fieldDisabled}` : ''}`}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {required && (
          <>
            {/* Asterisk is decorative — aria-hidden so AT reads "required" from the input */}
            <span aria-hidden="true" className={styles.requiredMark}> *</span>
          </>
        )}
      </label>

      {hasHint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}

      <input
        {...inputProps}
        id={inputId}
        disabled={disabled}
        required={required}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={describedBy}
        className={[styles.input, hasError && styles.inputError, className]
          .filter(Boolean)
          .join(' ')}
      />

      {/* Visible error: icon + text so color is not the only indicator (1.4.1).
          Linked via aria-describedby so it is re-read when the input is focused. */}
      {hasError && (
        <p id={errorId} className={styles.error}>
          <span className={styles.errorIcon} aria-hidden="true">⚠</span>
          {errorMessage}
        </p>
      )}

      {/* Persistent polite live region — always in the DOM so screen readers
          detect content changes and announce the error without moving focus (4.1.3). */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {errorMessage ?? ''}
      </div>
    </div>
  );
}
