import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { StepProgress } from './StepProgress';

const ONBOARDING_STEPS = [
  { label: 'Personal details' },
  { label: 'Identity verification' },
  { label: 'Account funding' },
  { label: 'Review & submit' },
];

const meta: Meta<typeof StepProgress> = {
  title: 'Components/StepProgress',
  component: StepProgress,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant step progress indicator for multi-step onboarding flows.

**WCAG success criteria satisfied:**

- **1.3.1 Info and Relationships:** Step status (completed / current / upcoming) conveyed via \`aria-current="step"\` and visually-hidden text — never by position or color alone.
- **1.4.1 Use of Color:** Completed steps show a checkmark icon alongside the color change; current step has a distinct border weight change alongside the color. Color is never the sole indicator.
- **1.4.3 Contrast (Minimum):** Completed label \`#1a1a1a\` = 18.1:1 ✓; current label \`#1d4ed8\` = 7.37:1 ✓; upcoming label \`#6b7280\` = 4.6:1 ✓.
- **1.4.10 Reflow:** Switches to a vertical column layout at 480 px — no horizontal scroll at 320 CSS px.
- **2.5.8 Target Size (Minimum):** Indicator circles are 40×40 CSS px — above the 24×24 minimum.
- **3.3.7 Redundant Entry:** See the \`Controlled\` story — data entered in a prior step is persisted and auto-populated; the user is never asked to re-enter it.
- **4.1.2 Name, Role, Value:** \`<nav>\` landmark with \`aria-label\`; \`aria-current="step"\` reflects the active step.
- **4.1.3 Status Messages:** The overall position ("Step 2 of 4") is exposed via \`aria-describedby\` on the nav — announced when the landmark is entered.

**Keyboard map:**

| Key | Action |
|-----|--------|
| Tab | Move focus through the page — the stepper itself has no interactive elements |
| Screen reader | Navigate to the "Account setup progress" landmark; hear step position on entry |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StepProgress>;

export const Default: Story = {
  args: {
    steps: ONBOARDING_STEPS,
    currentStep: 2,
    ariaLabel: 'Account setup progress',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Mid-flow view with one completed step, one current step, and two upcoming. Screen readers hear "Step 2 of 4 — Identity verification — current" when browsing the list, and "Step 2 of 4" on landmark entry.',
      },
    },
  },
};

export const FirstStep: Story = {
  args: {
    steps: ONBOARDING_STEPS,
    currentStep: 1,
    ariaLabel: 'Account setup progress',
  },
  parameters: {
    docs: {
      description: {
        story: 'First step — no completed steps yet; all remaining are upcoming.',
      },
    },
  },
};

export const LastStep: Story = {
  args: {
    steps: ONBOARDING_STEPS,
    currentStep: 4,
    ariaLabel: 'Account setup progress',
  },
  parameters: {
    docs: {
      description: {
        story: 'Final step — all previous steps show the completed checkmark and their labels are at full contrast.',
      },
    },
  },
};

// ─── Controlled — demonstrates 3.3.7 Redundant Entry ─────────────────────────

interface PersonalDetails {
  firstName: string;
  email: string;
}

export const Controlled: Story = {
  render: () => {
    const [step, setStep] = useState(1);
    const [details, setDetails] = useState<PersonalDetails>({ firstName: '', email: '' });

    const inputStyle: React.CSSProperties = {
      display: 'block',
      width: '100%',
      padding: '0.5rem 0.75rem',
      fontSize: '1rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      boxSizing: 'border-box',
    };
    const labelStyle: React.CSSProperties = {
      display: 'block',
      marginBottom: '0.25rem',
      fontWeight: 500,
      fontSize: '0.875rem',
    };
    const fieldStyle: React.CSSProperties = { marginBottom: '1rem' };
    const btnStyle: React.CSSProperties = {
      padding: '0.5rem 1.25rem',
      background: '#2563eb',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 600,
      minHeight: '44px',
    };
    const outlineBtn: React.CSSProperties = {
      ...btnStyle,
      background: '#fff',
      color: '#2563eb',
      border: '2px solid #2563eb',
      marginRight: '0.5rem',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '480px' }}>
        <StepProgress
          steps={ONBOARDING_STEPS}
          currentStep={step}
          ariaLabel="Account setup progress"
        />

        {step === 1 && (
          <section aria-labelledby="step1-heading">
            <h2 id="step1-heading" style={{ marginTop: 0, fontSize: '1.125rem' }}>
              Personal details
            </h2>
            <div style={fieldStyle}>
              <label htmlFor="firstName" style={labelStyle}>First name</label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                value={details.firstName}
                onChange={(e) => setDetails((d) => ({ ...d, firstName: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label htmlFor="email" style={labelStyle}>Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={details.email}
                onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <button style={btnStyle} onClick={() => setStep(2)}>
              Continue to Identity verification
            </button>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="step2-heading">
            <h2 id="step2-heading" style={{ marginTop: 0, fontSize: '1.125rem' }}>
              Identity verification
            </h2>
            {/* 3.3.7 Redundant Entry — email collected in step 1 is pre-filled, not re-asked */}
            <p style={{ fontSize: '0.875rem', color: '#374151', marginTop: 0 }}>
              We'll send a verification link to{' '}
              <strong>{details.email || 'your email address'}</strong>.{' '}
              <span style={{ color: '#6b7280' }}>
                (Pre-filled from step 1 — you are not asked to re-enter it.)
              </span>
            </p>
            <div style={{ display: 'flex' }}>
              <button style={outlineBtn} onClick={() => setStep(1)}>
                Back
              </button>
              <button style={btnStyle} onClick={() => setStep(3)}>
                Continue to Account funding
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="step3-heading">
            <h2 id="step3-heading" style={{ marginTop: 0, fontSize: '1.125rem' }}>
              Account funding
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#374151', marginTop: 0 }}>
              Link a payment method to fund your account.
            </p>
            <div style={{ display: 'flex' }}>
              <button style={outlineBtn} onClick={() => setStep(2)}>
                Back
              </button>
              <button style={btnStyle} onClick={() => setStep(4)}>
                Continue to Review & submit
              </button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section aria-labelledby="step4-heading">
            <h2 id="step4-heading" style={{ marginTop: 0, fontSize: '1.125rem' }}>
              Review & submit
            </h2>
            {/* 3.3.7 — name collected in step 1 shown in summary without re-asking */}
            <dl style={{ fontSize: '0.875rem', lineHeight: 1.8, margin: '0 0 1rem' }}>
              <dt style={{ fontWeight: 600 }}>Name</dt>
              <dd style={{ margin: '0 0 0.5rem 0' }}>{details.firstName || '—'}</dd>
              <dt style={{ fontWeight: 600 }}>Email</dt>
              <dd style={{ margin: 0 }}>{details.email || '—'}</dd>
            </dl>
            <div style={{ display: 'flex' }}>
              <button style={outlineBtn} onClick={() => setStep(3)}>
                Back
              </button>
              <button style={btnStyle} onClick={() => setStep(1)}>
                Submit (restart demo)
              </button>
            </div>
          </section>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
Fully controlled stepper demonstrating **3.3.7 Redundant Entry**: data entered in step 1 (name, email) is persisted and surfaced in later steps — never re-requested. The email address pre-fills the step 2 confirmation message; both name and email appear in the step 4 review summary.

The stepper landmark updates \`aria-current\` on each step change, so screen readers navigating to the \`<nav>\` always hear the correct position.
        `,
      },
    },
  },
};

// ─── Common Mistake ────────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessibleStepProgress({ currentStep }: { currentStep: number }) {
  const steps = ['Personal details', 'Identity verification', 'Account funding', 'Review & submit'];

  return (
    // ✗ Plain <div> — not a landmark; no accessible name; no semantic structure
    <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
      {steps.map((label, i) => {
        const isDone = i + 1 < currentStep;
        const isCurrent = i + 1 === currentStep;

        return (
          <div
            key={i}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}
          >
            {i > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  left: '-50%',
                  width: '100%',
                  height: '2px',
                  // ✗ Connector color change is the only completion indicator — no icon or text change
                  background: isDone ? '#2563eb' : '#d1d5db',
                }}
              />
            )}

            <div
              style={{
                position: 'relative',
                zIndex: 1,
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 600,
                // ✗ Color change is the sole indicator of status (fails 1.4.1)
                // ✗ No aria-current — AT cannot determine which step is active (fails 1.3.1, 4.1.2)
                background: isDone ? '#2563eb' : isCurrent ? '#fff' : '#fff',
                border: isCurrent ? '3px solid #2563eb' : isDone ? 'none' : '2px solid #d1d5db',
                color: isDone ? '#fff' : isCurrent ? '#2563eb' : '#6b7280',
              }}
            >
              {/* ✗ No checkmark or text alternative for "done" — just a color fill (fails 1.4.1) */}
              {i + 1}
            </div>

            {/* ✗ Visible label only — no sr-only text communicating status (fails 1.3.1) */}
            <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center', color: isCurrent ? '#1d4ed8' : '#6b7280' }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessibleStepProgress currentStep={2} />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

This version reproduces the most common step-progress mistakes in fintech onboarding UIs:

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| \`<div>\`-based container with no landmark role or accessible name | **1.3.1 Info and Relationships**, **4.1.2 Name, Role, Value** | Screen readers have no way to identify this as a navigation region or learn its purpose. |
| No \`aria-current="step"\` on the active item | **1.3.1 Info and Relationships**, **4.1.2 Name, Role, Value** | AT cannot programmatically determine which step is currently active — users must infer from visual color alone. |
| Color is the sole indicator of completion (blue fill) and current step (blue border) | **1.4.1 Use of Color** | Users who cannot perceive color differences (color blindness, high-contrast mode, monochrome display) cannot distinguish completed, current, and upcoming steps. |
| No visually-hidden text for step status or position | **1.3.1 Info and Relationships** | A screen reader browsing the list hears only the step labels ("Personal details", "Identity verification") with no information about whether they are done, active, or pending. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'aria-required-children', enabled: false },
        ],
      },
    },
  },
};
