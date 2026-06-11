import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import styles from './Modal.module.css';

export interface ModalProps {
  /** Controls visibility. */
  isOpen: boolean;
  /** Called on Esc, backdrop click, or the close button. */
  onClose: () => void;
  /** Visible dialog heading — also the accessible name via aria-labelledby. */
  title: string;
  /** Optional subheading linked via aria-describedby. */
  description?: string;
  /** Modal body content. */
  children: React.ReactNode;
  /**
   * Element to focus when the modal opens.
   * Defaults to the first focusable element inside the dialog.
   */
  initialFocusRef?: React.RefObject<HTMLElement>;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  initialFocusRef,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();

  const dialogRef = useFocusTrap<HTMLDivElement>({
    isActive: isOpen,
    onEscape: onClose,
    initialFocusRef,
  });

  // Lock background scroll while open (prevents layout shift and stops background
  // content from scrolling behind the backdrop — also removes a distraction for
  // sighted users and avoids confusing scroll position for AT users).
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    // Only close when the click lands directly on the backdrop, not on the dialog panel
    if (e.target === e.currentTarget) onClose();
  }

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      // Not role="presentation" — the backdrop is intentionally clickable,
      // but is not a focusable element; keyboard users close via Esc.
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={styles.dialog}
        // Ensure the panel itself is focusable as a last-resort focus target
        tabIndex={-1}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            {/* Icon is aria-hidden — the accessible name comes from aria-label above */}
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="none"
            >
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {description && (
          <p id={descId} className={styles.description}>
            {description}
          </p>
        )}

        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
