import React, { useId, useRef, useState } from 'react';
import styles from './OTPInput.module.css';

export interface OTPInputProps {
  /** Number of digit fields. Defaults to 6. */
  length?: number;
  /** Accessible label for the group. */
  label?: string;
  /** Error message. Triggers aria-invalid on every field. */
  errorMessage?: string;
  /** Disabled state applied to all fields. */
  disabled?: boolean;
  /** Fires whenever any digit changes. */
  onChange?: (code: string) => void;
  /** Fires when all digits are filled. */
  onComplete?: (code: string) => void;
}

export function OTPInput({
  length = 6,
  label = 'One-time passcode',
  errorMessage,
  disabled = false,
  onChange,
  onComplete,
}: OTPInputProps) {
  const errorId = useId();
  const statusId = useId();
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const [statusMessage, setStatusMessage] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const hasError = Boolean(errorMessage);

  function focus(index: number) {
    inputRefs.current[index]?.focus();
  }

  function commit(next: string[]) {
    setDigits(next);
    const code = next.join('');
    onChange?.(code);

    if (next.every(Boolean)) {
      // Announce completion via polite live region before calling onComplete (4.1.3)
      setStatusMessage(`Code complete: ${next.join(' ')}. Submitting.`);
      onComplete?.(code);
    }
  }

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    commit(next);
    if (digit && index < length - 1) focus(index + 1);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        commit(next);
      } else if (index > 0) {
        focus(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focus(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focus(index + 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    // Never block paste — required by 3.3.8 Accessible Authentication
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    const next = [...digits];
    pasted.split('').forEach((char, i) => { next[i] = char; });
    commit(next);

    // Move focus to first unfilled field, or last field if all filled
    const nextEmpty = next.findIndex((d) => !d);
    focus(nextEmpty === -1 ? length - 1 : nextEmpty);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    // Select existing digit so typing replaces it rather than appending
    e.target.select();
  }

  return (
    <div className={styles.wrapper}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{label}</legend>

        <div className={styles.inputs} role="group">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              disabled={disabled}
              // autocomplete="one-time-code" on the first field enables platform SMS/OTP autofill (3.3.8)
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              aria-label={`Digit ${index + 1} of ${length}`}
              aria-invalid={hasError ? true : undefined}
              aria-describedby={hasError ? errorId : undefined}
              className={`${styles.input}${hasError ? ` ${styles.inputError}` : ''}`}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={handleFocus}
            />
          ))}
        </div>
      </fieldset>

      {/* role="alert" causes immediate announcement when error appears (3.3.1, 4.1.3) */}
      {hasError && (
        <p id={errorId} className={styles.error} role="alert">
          <span className={styles.errorIcon} aria-hidden="true">⚠</span>
          {errorMessage}
        </p>
      )}

      {/* Polite live region announces code completion without moving focus (4.1.3) */}
      <div
        id={statusId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {statusMessage}
      </div>
    </div>
  );
}
