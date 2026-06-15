import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
].join(', ');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
    (el) => !el.closest('[inert]') && getComputedStyle(el).display !== 'none'
  );
}

interface UseFocusTrapOptions {
  /** Whether the trap is active. */
  isActive: boolean;
  /** Called when the user presses Escape. */
  onEscape: () => void;
  /** If provided, focus is moved to this element when the trap activates. Falls back to the first focusable element. */
  initialFocusRef?: React.RefObject<HTMLElement>;
}

/**
 * Traps keyboard focus within `containerRef` while `isActive` is true.
 * Moves focus to `initialFocusRef` (or the first focusable element) on activation.
 * Calls `onEscape` when the user presses Escape.
 */
export function useFocusTrap<T extends HTMLElement>(
  options: UseFocusTrapOptions
): React.RefObject<T> {
  const { isActive, onEscape, initialFocusRef } = options;
  const containerRef = useRef<T>(null);
  // Capture the element that had focus before the trap activated so we can restore it.
  const returnFocusRef = useRef<Element | null>(null);
  // Keep onEscape in a ref so the keydown handler always calls the latest version
  // without adding it to the effect deps (which would re-run the effect — and
  // re-initialize focus — on every render where onEscape is a new reference).
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!isActive) return;

    returnFocusRef.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Move focus into the trap
    const target = initialFocusRef?.current ?? getFocusableElements(container)[0] ?? container;
    // Defer by one frame so the element is fully painted before focus
    const frameId = requestAnimationFrame(() => {
      (target as HTMLElement).focus();
    });

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscapeRef.current();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements(container!);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener('keydown', handleKeyDown);
      // Return focus to the element that was active before the trap opened
      if (returnFocusRef.current && (returnFocusRef.current as HTMLElement).focus) {
        (returnFocusRef.current as HTMLElement).focus();
      }
    };
  }, [isActive, initialFocusRef]);

  return containerRef;
}
