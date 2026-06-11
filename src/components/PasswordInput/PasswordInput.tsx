import React, { useId, useState } from 'react';
import styles from './PasswordInput.module.css';

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  /** Visible label — always rendered as a real <label>. */
  label: string;
  /** Helper text shown below the label, linked via aria-describedby. */
  hint?: string;
  /** Validation error. Triggers aria-invalid and polite live-region announcement. */
  errorMessage?: string;
  /**
   * Maps to the input's autocomplete attribute.
   * Use "new-password" on registration/change-password forms.
   * Defaults to "current-password" (login forms).
   */
  autoComplete?: 'current-password' | 'new-password';
}

export function PasswordInput({
  label,
  hint,
  errorMessage,
  autoComplete = 'current-password',
  required,
  disabled,
  className,
  ...inputProps
}: PasswordInputProps) {
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();

  const [visible, setVisible] = useState(false);

  const hasHint = Boolean(hint);
  const hasError = Boolean(errorMessage);

  const describedBy =
    [hasHint ? hintId : null, hasError ? errorId : null].filter(Boolean).join(' ') || undefined;

  function toggle() {
    // State update only — focus naturally remains on the button (2.4.7, 4.1.2)
    setVisible((v) => !v);
  }

  return (
    <div className={`${styles.field}${disabled ? ` ${styles.fieldDisabled}` : ''}`}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {required && (
          <span aria-hidden="true" className={styles.requiredMark}> *</span>
        )}
      </label>

      {hasHint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}

      <div className={`${styles.inputWrapper}${hasError ? ` ${styles.inputWrapperError}` : ''}`}>
        <input
          {...inputProps}
          id={inputId}
          // Type switches between "password" and "text" — never block paste (3.3.8)
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          disabled={disabled}
          required={required}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={describedBy}
          className={[styles.input, className].filter(Boolean).join(' ')}
        />

        {/* Toggle is a real <button> so it is keyboard operable (2.1.1, 4.1.2).
            Visible text changes with state so the accessible name always describes
            the action, satisfying 2.5.3 Label in Name.
            aria-pressed reflects the current shown/hidden state (4.1.2). */}
        <button
          type="button"
          aria-pressed={visible}
          onClick={toggle}
          disabled={disabled}
          className={styles.toggle}
        >
          {/* SVG icon is decorative — aria-hidden; visible text carries the name */}
          <svg
            aria-hidden="true"
            focusable="false"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {visible ? (
              // Eye-off icon (password currently visible — action is to hide)
              <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            ) : (
              // Eye icon (password currently hidden — action is to show)
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
          <span>{visible ? 'Hide' : 'Show'} password</span>
        </button>
      </div>

      {hasError && (
        <p id={errorId} className={styles.error}>
          <span className={styles.errorIcon} aria-hidden="true">⚠</span>
          {errorMessage}
        </p>
      )}

      {/* Persistent polite live region — always in DOM so screen readers
          detect changes and announce errors without moving focus (4.1.3). */}
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
