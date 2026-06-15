import { useId, useRef, useState } from 'react';
import styles from './Combobox.module.css';
import type { ComboboxOption } from './Combobox';

export type { ComboboxOption };

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ComboboxMultiProps {
  /** Visible label — always rendered as a real <label>. */
  label: string;
  /** Full list of options to filter from. */
  options: ComboboxOption[];
  /** Controlled array of selected values. */
  value?: string[];
  /** Fires with the updated array on every selection change. */
  onChange?: (value: string[]) => void;
  /** Helper text below the label. Linked via aria-describedby. */
  hint?: string;
  /** Validation error. Sets aria-invalid and populates the live region. */
  errorMessage?: string;
  /** Sets required and aria-required. Visual asterisk is aria-hidden. */
  required?: boolean;
  /** Disables the entire component. */
  disabled?: boolean;
  /** Placeholder shown when no options are selected. */
  placeholder?: string;
  /** Override the generated id. */
  id?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ComboboxMulti({
  label,
  options,
  value = [],
  onChange,
  hint,
  errorMessage,
  required = false,
  disabled = false,
  placeholder = 'Type to search…',
  id: providedId,
}: ComboboxMultiProps) {
  const uid       = useId();
  const inputId   = providedId ?? uid;
  const listboxId = `${uid}-listbox`;
  const hintId    = `${uid}-hint`;
  const errorId   = `${uid}-error`;

  const [query, setQuery]                     = useState('');
  const [isOpen, setIsOpen]                   = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [liveMessage, setLiveMessage]         = useState('');

  const inputRef  = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter((o) => value.includes(o.value));

  const filteredOptions = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // ─── Announce selection changes to AT (4.1.3) ─────────────────────────────

  function announce(msg: string) {
    // Clear then set so repeated messages (unlikely but possible) still trigger
    setLiveMessage('');
    requestAnimationFrame(() => setLiveMessage(msg));
  }

  // ─── Toggle a single option in/out of the selection ───────────────────────

  function toggleOption(optionValue: string) {
    const opt  = options.find((o) => o.value === optionValue)!;
    let next: string[];
    let msg: string;

    if (value.includes(optionValue)) {
      next = value.filter((v) => v !== optionValue);
      msg  = `${opt.label} removed. ${next.length} item${next.length !== 1 ? 's' : ''} selected.`;
    } else {
      next = [...value, optionValue];
      msg  = `${opt.label} added. ${next.length} item${next.length !== 1 ? 's' : ''} selected.`;
    }

    onChange?.(next);
    announce(msg);
  }

  // ─── Remove a tag and return focus to the input ───────────────────────────

  function removeTag(optionValue: string) {
    const opt  = options.find((o) => o.value === optionValue)!;
    const next = value.filter((v) => v !== optionValue);
    onChange?.(next);
    announce(`${opt.label} removed. ${next.length} item${next.length !== 1 ? 's' : ''} selected.`);
    inputRef.current?.focus();
  }

  // ─── Keyboard handler on the input ────────────────────────────────────────

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((i) => Math.max(i - 1, 0));
        }
        break;
      }
      case 'Enter':
      case ' ': {
        if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          e.preventDefault();
          toggleOption(filteredOptions[highlightedIndex].value);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        setQuery('');
        break;
      }
      // Backspace on an empty input removes the last tag
      case 'Backspace': {
        if (query === '' && value.length > 0) {
          removeTag(value[value.length - 1]);
        }
        break;
      }
    }
  }

  // ─── Close when focus leaves the entire widget ────────────────────────────

  function handleBlur(e: React.FocusEvent) {
    const next = e.relatedTarget as Node | null;
    if (next && wrapperRef.current?.contains(next)) return;
    setIsOpen(false);
    setHighlightedIndex(-1);
    setQuery('');
  }

  // ─── Derived state ─────────────────────────────────────────────────────────

  const hasError    = Boolean(errorMessage);
  const describedBy = [hint ? hintId : null, hasError ? errorId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  const activeDescendant =
    isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]
      ? `${listboxId}-opt-${highlightedIndex}`
      : undefined;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className={`${styles.field}${disabled ? ` ${styles.fieldDisabled}` : ''}`}
      ref={wrapperRef}
      onBlur={handleBlur}
    >
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

      {/* Input wrapper — flex-wrap to accommodate tags */}
      <div
        className={`${styles.inputWrapper} ${styles.inputWrapperMulti}${hasError ? ` ${styles.inputWrapperError}` : ''}`}
        onClick={() => { if (!disabled) inputRef.current?.focus(); }}
      >
        {/* Selected-value tags */}
        {selectedOptions.map((opt) => (
          <span key={opt.value} className={styles.tag}>
            <span className={styles.tagLabel}>{opt.label}</span>
            <button
              type="button"
              className={styles.tagRemove}
              aria-label={`Remove ${opt.label}`}
              tabIndex={disabled ? -1 : 0}
              onClick={(e) => { e.stopPropagation(); removeTag(opt.value); }}
              onMouseDown={(e) => e.stopPropagation()} // don't trigger wrapper onClick
            >
              ×
            </button>
          </span>
        ))}

        {/* Combobox input */}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-invalid={hasError ? true : undefined}
          aria-required={required ? true : undefined}
          aria-describedby={describedBy}
          value={query}
          placeholder={selectedOptions.length === 0 ? placeholder : undefined}
          disabled={disabled}
          autoComplete="off"
          className={styles.multiInput}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedIndex(0);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => { if (!disabled) setIsOpen(true); }}
          onKeyDown={handleKeyDown}
        />

        {/* Dropdown chevron */}
        <span
          aria-hidden="true"
          className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ''}`}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {/* Listbox */}
      <ul
        id={listboxId}
        role="listbox"
        aria-multiselectable="true"
        aria-label={label}
        className={`${styles.listbox}${isOpen ? ` ${styles.listboxOpen}` : ''}`}
      >
        {filteredOptions.length === 0 ? (
          <li
            role="option"
            aria-selected={false}
            aria-disabled="true"
            className={styles.noResults}
          >
            No results found
          </li>
        ) : (
          filteredOptions.map((option, index) => {
            const isSelected    = value.includes(option.value);
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={option.value}
                id={`${listboxId}-opt-${index}`}
                role="option"
                aria-selected={isSelected}
                className={`${styles.option} ${styles.multiOption}${isHighlighted ? ` ${styles.optionHighlighted}` : ''}${isSelected ? ` ${styles.optionSelected}` : ''}`}
                onMouseDown={(e) => e.preventDefault()} // keep focus on input
                onClick={() => toggleOption(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {/* Checkmark occupies a fixed-width slot — not color alone (1.4.1) */}
                <span aria-hidden="true" className={styles.checkmark}>
                  {isSelected ? '✓' : ''}
                </span>
                {option.label}
              </li>
            );
          })
        )}
      </ul>

      {hasError && (
        <p id={errorId} className={styles.error}>
          <span aria-hidden="true" className={styles.errorIcon}>⚠</span>
          {errorMessage}
        </p>
      )}

      {/* Polite live region — announces add/remove + running count (4.1.3) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {liveMessage}
      </div>
    </div>
  );
}
