import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useToastContext } from '../../hooks/useToast';
import type { ToastItem, ToastSeverity } from '../../hooks/useToast';
import styles from './Toast.module.css';

// ─── Severity config ──────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  ToastSeverity,
  { label: string; role: 'status' | 'alert'; iconPath: string }
> = {
  info: {
    label: 'Information',
    role: 'status',
    iconPath: 'M8 7v5m0-8.5v1',
  },
  success: {
    label: 'Success',
    role: 'status',
    iconPath: 'M4 8.5l3 3 5-5',
  },
  warning: {
    label: 'Warning',
    role: 'alert',
    iconPath: 'M8 5v4m0 3v.5',
  },
  error: {
    label: 'Error',
    role: 'alert',
    iconPath: 'M5 5l6 6m0-6l-6 6',
  },
};

// ─── Individual toast item ────────────────────────────────────────────────────

function ToastItemComponent({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const config = SEVERITY_CONFIG[item.severity];
  const remainingRef = useRef(item.duration);
  const startedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startTimer() {
    if (item.duration === 0 || remainingRef.current <= 0) return;
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => onDismiss(item.id), remainingRef.current);
  }

  function pauseTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (startedAtRef.current !== null) {
      remainingRef.current -= Date.now() - startedAtRef.current;
      startedAtRef.current = null;
    }
  }

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // role="alert" (assertive) for warning/error; role="status" (polite) for info/success.
    // Injecting this element into the live region container triggers the AT announcement.
    <div
      role={config.role}
      aria-live={config.role === 'alert' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`${styles.toast} ${styles[item.severity]}`}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      onFocusCapture={pauseTimer}
      onBlurCapture={startTimer}
    >
      <span className={styles.iconWrapper} aria-hidden="true">
        <svg
          viewBox="0 0 16 16"
          width="18"
          height="18"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path
            d={config.iconPath}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span className={styles.content}>
        {/* Visually-hidden severity label so AT reads "Success: Transfer complete" (1.4.1) */}
        <span className={styles.srOnly}>{config.label}: </span>
        {item.message}
      </span>

      <button
        type="button"
        className={styles.dismissButton}
        aria-label="Dismiss notification"
        onClick={() => onDismiss(item.id)}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 16 16"
          width="14"
          height="14"
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
  );
}

// ─── Toast region ─────────────────────────────────────────────────────────────

/**
 * Renders active toasts in a fixed region at the bottom of the viewport.
 * Place this once near the root of your app, inside <ToastProvider>.
 */
export function ToastRegion() {
  const { toasts, dismiss } = useToastContext();

  return createPortal(
    <div className={styles.region} aria-label="Notifications">
      {toasts.map((item) => (
        <ToastItemComponent key={item.id} item={item} onDismiss={dismiss} />
      ))}
    </div>,
    document.body
  );
}
