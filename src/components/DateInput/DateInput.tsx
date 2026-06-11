import { useId, useRef, useState } from 'react';
import styles from './DateInput.module.css';

export interface DateValue {
  day: string;
  month: string;
  year: string;
}

export interface DateInputProps {
  /**
   * Text for the <legend> — describes the full date field to AT
   * (e.g. "Date of birth", "Transfer date").
   */
  legend: string;
  /** Controlled value. */
  value?: DateValue;
  /** Fires whenever any sub-field changes. */
  onChange?: (value: DateValue) => void;
  /** Helper text shown below the legend (e.g. "For example, 15 03 1990"). */
  hint?: string;
  /** Validation error. Sets aria-invalid on all three inputs. */
  errorMessage?: string;
  /** Whether the fields are required. */
  required?: boolean;
  /** Whether the fields are disabled. */
  disabled?: boolean;
}

const EMPTY: DateValue = { day: '', month: '', year: '' };

export function DateInput({
  legend,
  value,
  onChange,
  hint,
  errorMessage,
  required,
  disabled,
}: DateInputProps) {
  const dayId = useId();
  const monthId = useId();
  const yearId = useId();
  const hintId = useId();
  const errorId = useId();

  // Internal state for uncontrolled usage
  const [internal, setInternal] = useState<DateValue>(EMPTY);
  const active = value ?? internal;

  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  const hasError = Boolean(errorMessage);

  const describedBy =
    [hint ? hintId : null, hasError ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  function commit(next: DateValue) {
    if (onChange) {
      onChange(next);
    } else {
      setInternal(next);
    }
  }

  function handleDayChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
    commit({ ...active, day: raw });
    if (raw.length === 2) monthRef.current?.focus();
  }

  function handleMonthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
    commit({ ...active, month: raw });
    if (raw.length === 2) yearRef.current?.focus();
  }

  function handleYearChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    commit({ ...active, year: raw });
  }

  function handleMonthKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Backspace on an empty month field returns focus to the day field
    if (e.key === 'Backspace' && active.month === '') {
      dayRef.current?.focus();
    }
  }

  function handleYearKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Backspace on an empty year field returns focus to the month field
    if (e.key === 'Backspace' && active.year === '') {
      monthRef.current?.focus();
    }
  }

  const inputClass = (extra: string) =>
    [styles.input, extra, hasError ? styles.inputError : ''].filter(Boolean).join(' ');

  return (
    <fieldset
      className={`${styles.fieldset}${disabled ? ` ${styles.fieldsetDisabled}` : ''}`}
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

      <div className={styles.fieldsRow}>
        {/* Day */}
        <div className={styles.fieldGroup}>
          <label htmlFor={dayId} className={styles.label}>
            Day
          </label>
          <input
            ref={dayRef}
            id={dayId}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            placeholder="DD"
            value={active.day}
            disabled={disabled}
            required={required}
            aria-invalid={hasError ? true : undefined}
            aria-describedby={describedBy}
            className={inputClass(styles.inputShort)}
            onChange={handleDayChange}
          />
        </div>

        <span aria-hidden="true" className={styles.separator}>/</span>

        {/* Month */}
        <div className={styles.fieldGroup}>
          <label htmlFor={monthId} className={styles.label}>
            Month
          </label>
          <input
            ref={monthRef}
            id={monthId}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            placeholder="MM"
            value={active.month}
            disabled={disabled}
            required={required}
            aria-invalid={hasError ? true : undefined}
            aria-describedby={describedBy}
            className={inputClass(styles.inputShort)}
            onChange={handleMonthChange}
            onKeyDown={handleMonthKeyDown}
          />
        </div>

        <span aria-hidden="true" className={styles.separator}>/</span>

        {/* Year */}
        <div className={styles.fieldGroup}>
          <label htmlFor={yearId} className={styles.label}>
            Year
          </label>
          <input
            ref={yearRef}
            id={yearId}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            placeholder="YYYY"
            value={active.year}
            disabled={disabled}
            required={required}
            aria-invalid={hasError ? true : undefined}
            aria-describedby={describedBy}
            className={inputClass(styles.inputWide)}
            onChange={handleYearChange}
            onKeyDown={handleYearKeyDown}
          />
        </div>
      </div>

      {hasError && (
        <p id={errorId} className={styles.error}>
          <span aria-hidden="true" className={styles.errorIcon}>⚠</span>
          {errorMessage}
        </p>
      )}

      {/* Persistent polite live region for error announcements (4.1.3) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {errorMessage ?? ''}
      </div>
    </fieldset>
  );
}
