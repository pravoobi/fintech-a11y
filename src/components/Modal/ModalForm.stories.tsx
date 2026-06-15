import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { ModalForm } from './ModalForm';
import type { ModalFormField } from './ModalForm';

// ─── Shared field definitions ─────────────────────────────────────────────────

const SEND_PAYMENT_FIELDS: ModalFormField[] = [
  {
    name: 'recipient',
    label: 'Recipient name',
    required: true,
    autoComplete: 'name',
  },
  {
    name: 'accountNumber',
    label: 'Account number',
    required: true,
    inputMode: 'numeric',
    hint: '8-digit number shown on your bank statement',
    validate: (v) =>
      v.trim() && !/^\d{8}$/.test(v.trim())
        ? 'Account number must be exactly 8 digits.'
        : '',
  },
  {
    name: 'amount',
    label: 'Amount (GBP)',
    required: true,
    inputMode: 'decimal',
    hint: 'Enter the transfer amount, e.g. 100.00',
    validate: (v) => {
      if (!v.trim()) return '';
      if (!/^\d+(\.\d{1,2})?$/.test(v.trim()))
        return 'Enter a valid amount (e.g. 100.00).';
      if (parseFloat(v) <= 0) return 'Amount must be greater than zero.';
      return '';
    },
  },
  {
    name: 'reference',
    label: 'Payment reference',
    hint: 'Optional — up to 18 characters',
    maxLength: 18,
  },
];

// ─── Meta ──────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ModalForm> = {
  title: 'Components/ModalForm',
  component: ModalForm,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Modal dialog containing an accessible form — the most common fintech pattern where
accessibility breaks: payments, onboarding, profile edits.

**WCAG 2.2 AA criteria satisfied (in addition to the base Modal):**

- **1.3.1** Info & Relationships — every \`<input>\` has an associated \`<label>\` via \`htmlFor\`/\`id\`; hint and error text linked via \`aria-describedby\`.
- **2.4.3** Focus Order — focus moves to the first form field on open (via \`initialFocusRef\`), not the close button.
- **3.3.1** Error Identification — on submit failure, an error summary with a count heading appears; focus moves to the heading so AT announces "There are 3 errors in this form" without a live region announcement racing against inline errors.
- **3.3.2** Labels or Instructions — required fields marked with a visible asterisk (\`aria-hidden\`) and \`aria-required\`; hint text provides format instructions before the field.
- **3.3.3** Error Suggestion — each inline error message identifies the field and suggests the correct format.
- **4.1.2** Name, Role, Value — \`aria-invalid="true"\` set when a field is invalid; cleared when corrected. Submit button exposes its disabled/loading state via \`disabled\` + \`aria-disabled\`.
- **4.1.3** Status Messages — inline error containers are always present in the DOM with \`aria-live="polite"\`; when error text is inserted on blur, AT announces it without focus moving.
        `.trim(),
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ fontFamily: 'system-ui, sans-serif' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ModalForm>;

// ─── Default (Send payment) ────────────────────────────────────────────────────

export const Default: Story = {
  name: 'Default — Send payment',
  parameters: {
    docs: {
      description: {
        story: `
**Try the accessible patterns:**

1. Open the dialog — focus lands on "Recipient name" (first field), not the close button.
2. Tab past required fields without entering values, then click Submit — the error summary heading receives focus and AT announces the error count.
3. Fill a valid recipient but enter "123" for Account number and blur — AT announces the inline error "Account number must be exactly 8 digits." via the polite live region.
4. Fill all valid values and submit — the dialog closes and focus returns to the trigger.

**Keyboard map:**

| Key | Action |
|-----|--------|
| Tab / Shift+Tab | Navigate between fields and buttons |
| Enter (in a field) | Submits the form |
| Escape | Closes without submitting |
        `.trim(),
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [lastPayment, setLastPayment] = useState<Record<string, string> | null>(null);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
        <button
          onClick={() => setOpen(true)}
          style={triggerStyle}
        >
          Send payment
        </button>

        {lastPayment && (
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#16a34a' }}>
            ✓ Payment sent — Recipient: {lastPayment.recipient}, Amount: £{lastPayment.amount}
          </p>
        )}

        <ModalForm
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Send payment"
          description="Funds typically arrive within 2 hours on weekdays."
          fields={SEND_PAYMENT_FIELDS}
          submitLabel="Send payment"
          onSubmit={async (data) => {
            await new Promise((r) => setTimeout(r, 1000));
            setLastPayment(data);
          }}
        />
      </div>
    );
  },
};

// ─── Custom submit label ───────────────────────────────────────────────────────

export const ProfileUpdate: Story = {
  name: 'Profile update form',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component reused with a different set of fields and custom submit/cancel labels — demonstrates that the same accessible patterns apply to any form-in-modal.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const PROFILE_FIELDS: ModalFormField[] = [
      { name: 'displayName', label: 'Display name', required: true, autoComplete: 'name' },
      {
        name: 'email',
        label: 'Email address',
        type: 'email',
        required: true,
        autoComplete: 'email',
        validate: (v) =>
          v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
            ? 'Enter a valid email address.'
            : '',
      },
      { name: 'phone', label: 'Phone number', type: 'tel', inputMode: 'tel', autoComplete: 'tel' },
    ];

    return (
      <>
        <button onClick={() => setOpen(true)} style={triggerStyle}>
          Edit profile
        </button>
        <ModalForm
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Update profile"
          fields={PROFILE_FIELDS}
          submitLabel="Save changes"
          cancelLabel="Discard"
          onSubmit={async () => {}}
        />
      </>
    );
  },
};

// ─── Common Mistake ────────────────────────────────────────────────────────────

/**
 * INTENTIONAL ACCESSIBILITY VIOLATIONS — documented for educational purposes.
 *
 * A naive form-in-modal that relies solely on the browser's built-in HTML5
 * constraint validation. Violations:
 *
 * • **3.3.1** — On submit, the browser pops a native tooltip near the first
 *   invalid field. Screen readers on Windows (JAWS, NVDA) typically do NOT
 *   announce these tooltips. AT users receive no feedback about errors.
 * • **2.4.3** — Focus moves to the first invalid field via the browser's
 *   native validation, but the error is conveyed by a tooltip that is
 *   inaccessible. If JavaScript validation is added later without an error
 *   summary, focus stays on the submit button — users don't know which field
 *   failed or why.
 * • **1.3.1** — Labels are `<div>` elements with no `htmlFor`/`id` pairing.
 *   `<input>` elements have no programmatic label — announced as unlabelled.
 * • **4.1.2** — `aria-invalid` is never set; `aria-describedby` never links
 *   error text to the input. AT cannot announce inline errors.
 * • **3.3.3** — Error messages are shown as browser tooltips or plain text
 *   floated visually near the field but not linked via `aria-describedby`.
 */
export const CommonMistake: Story = {
  name: 'Common Mistake — HTML5 validation, no ARIA',
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'label',            enabled: false },
          { id: 'label-content-name-mismatch', enabled: false },
        ],
      },
    },
    docs: {
      description: {
        story: `
**Intentional violations — do not copy this pattern.**

Open the dialog, leave fields empty, and click Submit. Notice:

- The browser shows a tooltip on the first field — screen readers typically ignore it (JAWS, NVDA). AT users hear nothing.
- Inputs have no \`<label>\` — screen readers announce "edit text" with no context.
- No error summary — AT users cannot discover which fields failed.
- No \`aria-invalid\` — the invalid state is communicated visually only.

| Criterion | Failure |
|-----------|---------|
| 3.3.1 Error Identification | Browser tooltip is not announced by JAWS/NVDA |
| 1.3.1 Info & Relationships | Inputs unlabelled — \`<div>\` cannot be a label |
| 4.1.2 Name, Role, Value | No \`aria-invalid\`, no \`aria-describedby\` |
| 3.3.3 Error Suggestion | No programmatically determinable error text |
        `.trim(),
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)} style={triggerStyle}>
          Open (inaccessible form)
        </button>
        {open && (
          <div style={backdropStyle} onClick={() => setOpen(false)}>
            <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                {/* ✗ Not a <h2>, not linked as the dialog's accessible name */}
                <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>Send payment</div>
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
              </div>

              {/* ✗ Plain <form> with native HTML5 validation only */}
              <form onSubmit={(e) => { e.preventDefault(); setOpen(false); }}>
                {/* ✗ <div> label — not associated with the input */}
                <div style={divLabelStyle}>Recipient name</div>
                {/* ✗ No id, no aria-label, no aria-required */}
                <input type="text" required style={naiveInputStyle} />

                <div style={divLabelStyle}>Account number</div>
                {/* ✗ HTML pattern validation — error shown only as browser tooltip */}
                <input type="text" required pattern="\d{8}" style={naiveInputStyle} />

                <div style={divLabelStyle}>Amount</div>
                <input type="number" required min="0.01" step="0.01" style={naiveInputStyle} />

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                  <button type="button" style={secondaryBtn} onClick={() => setOpen(false)}>Cancel</button>
                  {/* ✗ No loading state; no aria-disabled */}
                  <button type="submit" style={primaryBtn}>Submit</button>
                </div>
              </form>
              {/* ✗ No error summary, no live region, no aria-invalid */}
            </div>
          </div>
        )}
      </>
    );
  },
};

// ─── Shared styles ─────────────────────────────────────────────────────────────

const triggerStyle: React.CSSProperties = {
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

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem',
};

const panelStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '8px',
  padding: '1.5rem',
  width: '100%',
  maxWidth: '32rem',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};

const divLabelStyle: React.CSSProperties = {
  marginBottom: '0.25rem',
  fontWeight: 600,
  fontSize: '0.875rem',
  color: '#374151',
};

const naiveInputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '1rem',
  marginBottom: '1rem',
  boxSizing: 'border-box',
};

const primaryBtn: React.CSSProperties = {
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

const secondaryBtn: React.CSSProperties = {
  padding: '0.5rem 1.25rem',
  background: '#fff',
  color: '#374151',
  border: '2px solid #d1d5db',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 600,
  minHeight: '44px',
};

