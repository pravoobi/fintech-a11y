import { useId } from 'react';
import styles from './StepProgress.module.css';

export interface StepProgressStep {
  /** Visible step label (e.g. "Personal details"). */
  label: string;
}

export interface StepProgressProps {
  /** Ordered list of steps. */
  steps: StepProgressStep[];
  /**
   * 1-based index of the active step.
   * Steps before this are "completed"; steps after are "upcoming".
   */
  currentStep: number;
  /** Accessible name for the <nav> landmark (e.g. "Account setup progress"). */
  ariaLabel: string;
}

type StepStatus = 'completed' | 'current' | 'upcoming';

function getStatus(stepIndex: number, currentStep: number): StepStatus {
  if (stepIndex + 1 < currentStep) return 'completed';
  if (stepIndex + 1 === currentStep) return 'current';
  return 'upcoming';
}

export function StepProgress({ steps, currentStep, ariaLabel }: StepProgressProps) {
  const navId = useId();

  return (
    <nav aria-label={ariaLabel} aria-describedby={navId} className={styles.nav}>
      {/* Visually-hidden summary for AT — announces overall position on landmark entry */}
      <span id={navId} className={styles.srOnly}>
        Step {currentStep} of {steps.length}
      </span>

      <ol className={styles.list} role="list">
        {steps.map((step, index) => {
          const status = getStatus(index, currentStep);
          const stepNumber = index + 1;

          return (
            <li
              key={index}
              className={`${styles.step} ${styles[status]}`}
              aria-current={status === 'current' ? 'step' : undefined}
            >
              <span className={styles.indicator} aria-hidden="true">
                {status === 'completed' ? (
                  <svg
                    viewBox="0 0 16 16"
                    width="16"
                    height="16"
                    fill="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M3 8l3.5 3.5L13 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span aria-hidden="true">{stepNumber}</span>
                )}
              </span>

              <span className={styles.labelWrapper}>
                {/* Visible label */}
                <span className={styles.label} aria-hidden="true">
                  {step.label}
                </span>

                {/* Full AT announcement: status + number + label */}
                <span className={styles.srOnly}>
                  {status === 'completed' && `Step ${stepNumber} of ${steps.length} — ${step.label} — completed`}
                  {status === 'current' && `Step ${stepNumber} of ${steps.length} — ${step.label} — current`}
                  {status === 'upcoming' && `Step ${stepNumber} of ${steps.length} — ${step.label}`}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
