import React, { useEffect, useId, useRef, useState } from 'react';
import styles from './AmountInput.module.css';

export interface AmountInputProps {
  /** Visible label — always rendered as a real <label>. */
  label: string;
  /**
   * Visual currency symbol shown before the input (e.g. "$", "£", "€").
   * Rendered aria-hidden — AT reads currencyLabel instead.
   */
  currencySymbol?: string;
  /**
   * Full currency name announced to assistive technology (e.g. "US dollars").
   * Linked to the input via aria-describedby. Defaults to currencySymbol if omitted.
   */
  currencyLabel?: string;
  /** Helper text shown below the label. */
  hint?: string;
  /** Validation error. Triggers aria-invalid and polite live-region announcement. */
  errorMessage?: string;
  /** Controlled numeric value. */
  value?: number;
  /** Fires on blur with the parsed numeric value, or undefined if the field is empty/invalid. */
  onChange?: (value: number | undefined) => void;
  /** Whether the field is required. */
  required?: boolean;
  /** Whether the field is disabled. */
  disabled?: boolean;
  /** Placeholder shown inside the input. */
  placeholder?: string;
}

function formatForDisplay(num: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function parseRaw(raw: string): number | undefined {
  // Strip everything except digits and the decimal point
  const cleaned = raw.replace(/[^0-9.]/g, '');
  if (!cleaned) return undefined;
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

export function AmountInput({
  label,
  currencySymbol,
  currencyLabel,
  hint,
  errorMessage,
  value,
  onChange,
  required,
  disabled,
  placeholder = '0.00',
}: AmountInputProps) {
  const inputId = useId();
  const currencyDescId = useId();
  const hintId = useId();
  const errorId = useId();

  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState<string>(
    value !== undefined ? formatForDisplay(value) : ''
  );

  // Track the last value prop so we only re-sync when it actually changes externally.
  // Without this, the effect would also re-fire when isFocused changes (e.g. on blur),
  // wiping the formatted value handleBlur just set when no controlled value is passed.
  const prevValueRef = useRef<number | undefined>(value);
  useEffect(() => {
    if (prevValueRef.current === value) return;
    prevValueRef.current = value;
    if (!isFocused) {
      setDisplayValue(value !== undefined ? formatForDisplay(value) : '');
    }
  }, [value, isFocused]);

  const hasError = Boolean(errorMessage);
  const hasCurrencyDesc = Boolean(currencySymbol ?? currencyLabel);

  const describedBy =
    [
      hasCurrencyDesc ? currencyDescId : null,
      hint ? hintId : null,
      hasError ? errorId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  function handleFocus() {
    setIsFocused(true);
    // Strip thousands separators so the user edits a plain number
    setDisplayValue((v) => v.replace(/,/g, ''));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Allow only digits, one decimal point, and leading minus for negative amounts
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    setDisplayValue(raw);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    setIsFocused(false);
    // Read e.target.value (DOM value) rather than displayValue state — the state
    // setter from handleChange may not have re-rendered yet when blur fires.
    const parsed = parseRaw(e.target.value);
    // Format on blur — never format during keystroke to avoid caret jumping (1.3.1)
    setDisplayValue(parsed !== undefined ? formatForDisplay(parsed) : '');
    onChange?.(parsed);
  }

  return (
    <div className={`${styles.field}${disabled ? ` ${styles.fieldDisabled}` : ''}`}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {required && (
          <span aria-hidden="true" className={styles.requiredMark}> *</span>
        )}
      </label>

      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}

      <div className={`${styles.inputWrapper}${hasError ? ` ${styles.inputWrapperError}` : ''}`}>
        {currencySymbol && (
          // Symbol is aria-hidden — the currency is announced via the hidden description below
          <span aria-hidden="true" className={styles.currencySymbol}>
            {currencySymbol}
          </span>
        )}

        <input
          id={inputId}
          type="text"
          // Decimal keyboard on mobile without the browser-native number input quirks
          inputMode="decimal"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={describedBy}
          className={styles.input}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      {/* Visually hidden currency description ensures AT announces the unit (1.3.1, 4.1.2).
          The $ symbol above is aria-hidden so this is the sole source of currency info for AT. */}
      {hasCurrencyDesc && (
        <span id={currencyDescId} className={styles.srOnly}>
          {currencyLabel ?? currencySymbol}
        </span>
      )}

      {hasError && (
        <p id={errorId} className={styles.error}>
          <span aria-hidden="true" className={styles.errorIcon}>⚠</span>
          {errorMessage}
        </p>
      )}

      {/* Persistent polite live region for error announcements without focus move (4.1.3) */}
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
