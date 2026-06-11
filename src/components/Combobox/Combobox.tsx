import { useEffect, useId, useRef, useState } from 'react';
import styles from './Combobox.module.css';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  /** Visible label — always rendered as a real <label>. */
  label: string;
  /** Full list of options to filter from. */
  options: ComboboxOption[];
  /** Controlled selected value. */
  value?: string;
  /** Fires when an option is selected or the field is cleared. */
  onChange?: (value: string | undefined) => void;
  /** Helper text shown below the label. */
  hint?: string;
  /** Validation error. Triggers aria-invalid and polite live-region announcement. */
  errorMessage?: string;
  /** Whether the field is required. */
  required?: boolean;
  /** Whether the field is disabled. */
  disabled?: boolean;
  /** Placeholder shown inside the input. */
  placeholder?: string;
}

export function Combobox({
  label,
  options,
  value,
  onChange,
  hint,
  errorMessage,
  required,
  disabled,
  placeholder = 'Search…',
}: ComboboxProps) {
  const inputId = useId();
  const listboxId = useId();
  const hintId = useId();
  const errorId = useId();
  const statusId = useId();

  // query: text currently in the input while the listbox is open
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  // Internal value for uncontrolled usage
  const [internalValue, setInternalValue] = useState<string | undefined>(undefined);

  const activeValue = value !== undefined ? value : internalValue;
  const selectedOption = options.find((o) => o.value === activeValue);

  const filteredOptions = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const inputRef = useRef<HTMLInputElement>(null);

  // When value prop changes externally while closed, nothing to sync —
  // display is derived from selectedOption on render.
  const hasSelection = Boolean(selectedOption);
  const hasError = Boolean(errorMessage);

  // Stable option ID helper
  function optionId(index: number) {
    return `${listboxId}-opt-${index}`;
  }

  const activedescendant =
    isOpen && highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined;

  const describedBy =
    [hint ? hintId : null, hasError ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  // ─── Announce result count to AT (4.1.3) ────────────────────────────────────
  const [statusMessage, setStatusMessage] = useState('');
  useEffect(() => {
    if (!isOpen) return;
    if (filteredOptions.length === 0) {
      setStatusMessage('No results found');
    } else {
      setStatusMessage(`${filteredOptions.length} result${filteredOptions.length === 1 ? '' : 's'} available`);
    }
  }, [filteredOptions.length, isOpen]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  function openList() {
    setIsOpen(true);
    setHighlightedIndex(-1);
  }

  function closeList() {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function selectOption(option: ComboboxOption) {
    setQuery(option.label);
    if (onChange) {
      onChange(option.value);
    } else {
      setInternalValue(option.value);
    }
    closeList();
    inputRef.current?.focus();
  }

  function clearSelection() {
    setQuery('');
    if (onChange) {
      onChange(undefined);
    } else {
      setInternalValue(undefined);
    }
    closeList();
    inputRef.current?.focus();
  }

  function handleFocus() {
    // Pre-fill the query with the selected label so the user can refine it
    setQuery(selectedOption?.label ?? '');
    openList();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setHighlightedIndex(-1);
    if (!isOpen) openList();
    // Typing clears the selection without calling onChange until an option is picked
    if (!e.target.value && hasSelection) {
      if (onChange) onChange(undefined);
      else setInternalValue(undefined);
    }
  }

  function handleBlur() {
    // Let option mousedown fire first — it calls e.preventDefault() to keep focus,
    // so blur only fires when focus genuinely leaves the widget.
    closeList();
    // Revert the query to the selected option's label (or empty)
    setQuery(selectedOption?.label ?? '');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!isOpen) {
          openList();
          setHighlightedIndex(0);
          return;
        }
        setHighlightedIndex((i) =>
          i < filteredOptions.length - 1 ? i + 1 : i
        );
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (!isOpen) return;
        if (highlightedIndex <= 0) {
          setHighlightedIndex(-1); // back to input
        } else {
          setHighlightedIndex((i) => i - 1);
        }
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          selectOption(filteredOptions[highlightedIndex]);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        closeList();
        setQuery(selectedOption?.label ?? '');
        break;
      }
      case 'Tab': {
        // Select highlighted option on Tab (so keyboard users don't lose their choice)
        if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          selectOption(filteredOptions[highlightedIndex]);
        }
        closeList();
        break;
      }
    }
  }

  // Display value: query while open; selected label while closed
  const displayValue = isOpen ? query : (selectedOption?.label ?? '');

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
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activedescendant}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={styles.input}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />

        {/* Clear button — shown when there is a selection or typed text */}
        {(hasSelection || query) && !disabled && (
          <button
            type="button"
            className={styles.clearButton}
            aria-label="Clear selection"
            tabIndex={-1}
            onMouseDown={(e) => e.preventDefault()} // keep focus on input
            onClick={clearSelection}
          >
            <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="12" height="12" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Dropdown chevron */}
        <span aria-hidden="true" className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ''}`}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* Listbox */}
      <ul
        id={listboxId}
        role="listbox"
        aria-label={label}
        className={`${styles.listbox}${isOpen ? ` ${styles.listboxOpen}` : ''}`}
      >
        {filteredOptions.length === 0 ? (
          // role="option" with aria-disabled so AT doesn't skip it
          <li role="option" aria-selected={false} aria-disabled="true" className={styles.noResults}>
            No results found
          </li>
        ) : (
          filteredOptions.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={option.value === activeValue}
              className={`${styles.option}
                ${index === highlightedIndex ? styles.optionHighlighted : ''}
                ${option.value === activeValue ? styles.optionSelected : ''}`}
              onMouseDown={(e) => e.preventDefault()} // keep focus on input
              onClick={() => selectOption(option)}
            >
              {option.label}
              {option.value === activeValue && (
                <span aria-hidden="true" className={styles.selectedMark}>✓</span>
              )}
            </li>
          ))
        )}
      </ul>

      {hasError && (
        <p id={errorId} className={styles.error}>
          <span aria-hidden="true" className={styles.errorIcon}>⚠</span>
          {errorMessage}
        </p>
      )}

      {/* Polite live region — announces result count and errors (4.1.3) */}
      <div
        id={statusId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {isOpen ? statusMessage : (errorMessage ?? '')}
      </div>
    </div>
  );
}
