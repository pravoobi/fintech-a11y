import React, { useId } from 'react';
import styles from './Alert.module.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  /** Severity — drives role, icon, and color. Never the sole differentiator (1.4.1). */
  variant: AlertVariant;
  /** Optional bold heading inside the alert. */
  title?: string;
  /** Alert body content. */
  children: React.ReactNode;
  /** If provided, renders a dismiss button. */
  onDismiss?: () => void;
}

const ICONS: Record<AlertVariant, string> = {
  info:    'ℹ',
  success: '✓',
  warning: '⚠',
  error:   '✕',
};

const SR_LABELS: Record<AlertVariant, string> = {
  info:    'Information:',
  success: 'Success:',
  warning: 'Warning:',
  error:   'Error:',
};

// error + warning interrupt immediately; info + success wait politely
const ROLES: Record<AlertVariant, 'alert' | 'status'> = {
  error:   'alert',
  warning: 'alert',
  info:    'status',
  success: 'status',
};

export function Alert({ variant, title, children, onDismiss }: AlertProps) {
  const titleId = useId();

  return (
    <div
      role={ROLES[variant]}
      aria-labelledby={title ? titleId : undefined}
      className={`${styles.alert} ${styles[variant]}`}
    >
      <span className={styles.icon} aria-hidden="true">
        {ICONS[variant]}
      </span>

      {/* Visually-hidden severity label — ensures variant is not conveyed by color alone (1.4.1) */}
      <span className={styles.srOnly}>{SR_LABELS[variant]}</span>

      <div className={styles.body}>
        {title && (
          <p id={titleId} className={styles.title}>
            {title}
          </p>
        )}
        <div className={styles.message}>{children}</div>
      </div>

      {onDismiss && (
        <button
          type="button"
          className={styles.dismiss}
          aria-label={`Dismiss ${variant} alert`}
          onClick={onDismiss}
        >
          <span aria-hidden="true">✕</span>
        </button>
      )}
    </div>
  );
}
