import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { RadioGroup } from './RadioGroup';
import type { RadioOption } from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant radio group for financial-services onboarding flows — account type selection, payment method, transfer frequency, risk appetite.

**WCAG success criteria satisfied:**

- **1.3.1 Info and Relationships:** \`<fieldset>\` + \`<legend>\` groups the options; each option has a \`<label>\` associated with its \`<input type="radio">\` — structure is programmatically determinable.
- **1.4.1 Use of Color:** Selected state uses the native radio checked indicator + a blue border on the option row — never colour alone.
- **1.4.3 Contrast (Minimum):** Label text \`#1a1a1a\` = 18.1:1 ✓; hint text \`#6b7280\` = 4.6:1 ✓; error \`#dc2626\` = 5.74:1 ✓.
- **2.1.1 Keyboard:** Tab enters the group at the selected/first option; Arrow keys navigate between options and select them; Tab exits the group.
- **2.5.8 Target Size (Minimum):** Each option row is 44 CSS px tall — the entire row is the click/tap target, not just the radio circle.
- **3.3.1 / 3.3.2 Error / Labels:** Error linked via \`aria-describedby\`; \`aria-invalid\` on all inputs; persistent visible labels.
- **4.1.2 Name, Role, Value:** \`aria-invalid\`, \`aria-describedby\`, \`aria-required\` on each input.
- **4.1.3 Status Messages:** Errors announced via polite \`role="status"\` live region without focus movement.

**Keyboard map:**

| Key | Action |
|-----|--------|
| \`Tab\` | Enter group at selected option (or first if none selected) |
| \`ArrowDown\` / \`ArrowRight\` | Next option (wraps) |
| \`ArrowUp\` / \`ArrowLeft\` | Previous option (wraps) |
| \`Tab\` (from any option) | Exit group to next focusable element |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

const ACCOUNT_OPTIONS: RadioOption[] = [
  { value: 'personal',  label: 'Personal account',  hint: 'For everyday banking and savings' },
  { value: 'joint',     label: 'Joint account',      hint: 'Shared with another person' },
  { value: 'business',  label: 'Business account',   hint: 'For sole traders and limited companies' },
];

const PAYMENT_OPTIONS: RadioOption[] = [
  { value: 'faster',  label: 'Faster Payments',  hint: 'Arrives within 2 hours · Free' },
  { value: 'bacs',    label: 'BACS',              hint: 'Arrives in 3 working days · Free' },
  { value: 'chaps',   label: 'CHAPS',             hint: 'Same day if sent before 3 pm · £25 fee' },
];

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    legend: 'Account type',
    name: 'account-type',
    options: ACCOUNT_OPTIONS,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Tab into the group — focus lands on the first option. Use ArrowDown/ArrowUp to navigate. Tab exits to the next focusable element. Each option row is the full click target (not just the radio circle).',
      },
    },
  },
};

// ─── With error ───────────────────────────────────────────────────────────────

export const WithError: Story = {
  args: {
    legend: 'Account type',
    name: 'account-type-error',
    options: ACCOUNT_OPTIONS,
    errorMessage: 'Select an account type to continue.',
  },
  parameters: {
    docs: {
      description: {
        story:
          '`aria-invalid="true"` set on all three inputs; error linked via `aria-describedby`. The ⚠ icon ensures error state is not conveyed by colour alone (1.4.1). The polite live region announces the error without moving focus (4.1.3).',
      },
    },
  },
};

// ─── Controlled with validation ───────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    function validate(v: string) {
      return v ? '' : 'Select a payment method to continue.';
    }

    function handleChange(v: string) {
      setValue(v);
      if (submitted) setError(validate(v));
    }

    function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setSubmitted(true);
      setError(validate(value));
    }

    const selected = PAYMENT_OPTIONS.find((o) => o.value === value);

    return (
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <RadioGroup
          legend="Payment method"
          name="payment-method"
          options={PAYMENT_OPTIONS}
          value={value}
          onChange={handleChange}
          hint="Choose how you'd like to send this payment."
          errorMessage={error}
          required
        />
        <button
          type="submit"
          style={{
            padding: '0.5rem 1.25rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            minHeight: '44px',
            alignSelf: 'flex-start',
          }}
        >
          Continue
        </button>
        {submitted && !error && selected && (
          <p style={{ fontSize: '0.875rem', color: '#16a34a', margin: 0 }}>
            ✓ Payment method: {selected.label}
          </p>
        )}
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Validation fires on submit and updates on subsequent changes. Submit without selecting — the error is announced via live region. Select an option — error clears immediately.',
      },
    },
  },
};

// ─── Required ─────────────────────────────────────────────────────────────────

export const Required: Story = {
  args: {
    legend: 'Account type',
    name: 'account-type-required',
    options: ACCOUNT_OPTIONS,
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'All inputs carry `required` and `aria-required="true"`. The visual asterisk in the legend is `aria-hidden` — screen readers announce "required" from the input attribute, not the asterisk.',
      },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    legend: 'Account type',
    name: 'account-type-disabled',
    options: ACCOUNT_OPTIONS,
    value: 'personal',
    onChange: () => {},
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'All inputs disabled and visually muted. Pre-selected value still shows.',
      },
    },
  },
};

// ─── Partial disabled ─────────────────────────────────────────────────────────

export const PartialDisabled: Story = {
  args: {
    legend: 'Payment method',
    name: 'payment-partial',
    options: [
      { value: 'faster', label: 'Faster Payments', hint: 'Arrives within 2 hours · Free' },
      { value: 'chaps',  label: 'CHAPS', hint: 'Not available for this account type', disabled: true },
      { value: 'bacs',   label: 'BACS',  hint: 'Arrives in 3 working days · Free' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Individual options can be disabled via `option.disabled`. CHAPS is unavailable for this account type. Arrow-key navigation skips disabled options in native browser behaviour.',
      },
    },
  },
};

// ─── Common Mistake ───────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessibleRadioGroup() {
  const [selected, setSelected] = useState('');

  const options = [
    { value: 'personal', label: 'Personal account' },
    { value: 'joint',    label: 'Joint account' },
    { value: 'business', label: 'Business account' },
  ];

  return (
    // ✗ Plain <div> — no <fieldset> or <legend> — group purpose not determinable (fails 1.3.1)
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}>
        Account type
      </span>

      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          // ✗ <div> with onClick — not keyboard operable (fails 2.1.1)
          // ✗ No <input type="radio"> — no native role, no checked state for AT (fails 4.1.2)
          // ✗ Selected state shown by background color only — no semantic indicator (fails 1.4.1)
          <div
            key={option.value}
            onClick={() => setSelected(option.value)}
            style={{
              padding: '0.625rem 0.75rem',
              border: `1.5px solid ${isSelected ? '#2563eb' : '#d1d5db'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              background: isSelected ? '#eff6ff' : '#ffffff',
              fontSize: '0.875rem',
              color: isSelected ? '#2563eb' : '#1a1a1a',
              fontWeight: isSelected ? 600 : 400,
              userSelect: 'none',
            }}
          >
            {option.label}
          </div>
        );
      })}
      {/* ✗ No error linkage via aria-describedby (fails 3.3.1) */}
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessibleRadioGroup />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

Tab into the story — nothing receives focus. The options are invisible to keyboard users.

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| No \`<fieldset>\` + \`<legend>\` | **1.3.1 Info and Relationships** | The group has no accessible name and no programmatic grouping. AT announces three separate unlabelled elements with no indication they form a choice group. |
| \`<div onClick>\` instead of \`<input type="radio">\` | **2.1.1 Keyboard**, **4.1.2 Name, Role, Value** | \`<div>\` is not in the tab order. Keyboard users cannot reach or activate any option. AT has no role, no checked state, and no group semantics. |
| Selected state by background colour only | **1.4.1 Use of Color** | Blue background signals selection — but a user who cannot perceive colour cannot determine which option is selected. There is no \`aria-checked\` or \`checked\` attribute for AT. |
| No \`aria-describedby\` for errors | **3.3.1 Error Identification** | If a validation error appears, it cannot be programmatically linked to the inputs. AT users will not know which field the error refers to. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'aria-required-children', enabled: false },
          { id: 'region',                 enabled: false },
        ],
      },
    },
  },
};
