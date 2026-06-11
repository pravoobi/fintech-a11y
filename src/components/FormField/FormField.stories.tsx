import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { FormField } from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant form field combining a visible label, optional hint, input, and inline validation for financial-services forms.

**WCAG success criteria satisfied:**
- **1.3.1 Info and Relationships:** Real \`<label>\` associated via \`htmlFor\`/\`id\`; hint and error linked via \`aria-describedby\`.
- **1.4.1 Use of Color:** Error state uses an icon + text alongside the border change — color is never the sole indicator.
- **1.4.3 Contrast (Minimum):** All text meets 4.5:1; hint text (#6b7280) = 4.6:1.
- **1.4.11 Non-text Contrast:** Focus ring and error border (#dc2626) both ≥ 3:1.
- **2.4.7 Focus Visible:** 3px solid outline on \`:focus-visible\`.
- **2.5.8 Target Size:** Input height ≥ 44px CSS.
- **3.3.1 Error Identification:** Error text rendered visibly and linked via \`aria-describedby\`.
- **3.3.2 Labels or Instructions:** Persistent visible label; never a placeholder substitute.
- **3.3.3 Error Suggestion:** Error message text is descriptive and actionable.
- **4.1.2 Name, Role, Value:** Input has an accessible name, correct role, and reflects \`aria-invalid\` state.
- **4.1.3 Status Messages:** Validation errors announced via a persistent polite \`role="status"\` live region — no focus move required.

**Keyboard map:**

| Key | Action |
|-----|--------|
| Tab | Move focus to the input |
| Shift+Tab | Move focus away |
| (typing) | Enter value |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  args: {
    label: 'Email address',
    type: 'email',
    placeholder: 'you@example.com',
  },
  parameters: {
    docs: {
      description: {
        story: 'Accessible implementation. Label is always visible and programmatically associated with the input.',
      },
    },
  },
};

export const WithHint: Story = {
  args: {
    label: 'Email address',
    type: 'email',
    hint: "We'll send your monthly statement here.",
    placeholder: 'you@example.com',
  },
  parameters: {
    docs: {
      description: {
        story: 'Hint text is linked via `aria-describedby` so screen readers announce it after the field label and role.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    label: 'Email address',
    type: 'email',
    hint: "We'll send your monthly statement here.",
    errorMessage: 'Enter a valid email address, for example: you@example.com',
    defaultValue: 'not-an-email',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Error state: `aria-invalid="true"` is set on the input; the error is linked via `aria-describedby`; the polite live region announces the message without moving focus (4.1.3). The ⚠ icon ensures color is not the sole error indicator (1.4.1).',
      },
    },
  },
};

export const Required: Story = {
  args: {
    label: 'Sort code',
    hint: 'Must be 6 digits, for example: 00-00-00',
    required: true,
    placeholder: '00-00-00',
    pattern: '[0-9-]{6,8}',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Required field: the `required` attribute communicates the constraint to assistive technology. The visual asterisk is `aria-hidden` so AT does not read "asterisk" — it reads "required" from the native attribute instead.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    label: 'Account number',
    defaultValue: '12345678',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state — the input is marked disabled and the label/hint are visually muted.',
      },
    },
  },
};

export const LiveValidation: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    function validate(v: string) {
      if (!v) return setError('');
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      setError(valid ? '' : 'Enter a valid email address, for example: you@example.com');
    }

    return (
      <FormField
        label="Email address"
        type="email"
        hint="We'll send your monthly statement here."
        value={value}
        errorMessage={error}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => validate(e.target.value)}
        placeholder="you@example.com"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Live validation on blur. Type an invalid email and tab away — the error appears and is announced via the polite live region without focus moving (4.1.3).',
      },
    },
  },
};

// ─── Common Mistake ────────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessibleFormField() {
  const [value, setValue] = useState('');
  const hasError = value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
      {/* ✗ No <label> — placeholder is the only visible label (fails 3.3.2, 1.3.1) */}
      <input
        type="email"
        value={value}
        placeholder="Email address"
        onChange={(e) => setValue(e.target.value)}
        style={{
          padding: '0.625rem 0.75rem',
          fontSize: '1rem',
          // ✗ Red border is the ONLY error indicator — no icon, no text (fails 1.4.1)
          border: hasError ? '2px solid red' : '2px solid #ccc',
          borderRadius: '6px',
          outline: 'none',
        }}
      />
      {/* ✗ Error text rendered but not linked via aria-describedby (fails 3.3.1)
          ✗ No aria-invalid on the input (fails 4.1.2)
          ✗ No live region — screen readers stay silent (fails 4.1.3) */}
      {hasError && (
        <span style={{ color: 'red', fontSize: '0.875rem' }}>Invalid email</span>
      )}
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessibleFormField />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

Type an invalid email to trigger the error state. This version reproduces mistakes commonly seen in fintech forms:

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| No \`<label>\` — placeholder is the only label | **3.3.2 Labels or Instructions**, **1.3.1 Info and Relationships** | Placeholder disappears as soon as the user types. Screen readers may not announce it consistently. AT cannot derive the field's purpose once text is entered. |
| Red border is the only error indicator | **1.4.1 Use of Color** | Users who cannot perceive color (color-blind, low-vision, high-contrast mode) see no indication that the field is invalid. |
| Error text not linked via \`aria-describedby\` | **3.3.1 Error Identification** | The error message is visually present but programmatically disconnected. Screen readers do not associate it with the field. |
| No \`aria-invalid\` on the input | **4.1.2 Name, Role, Value** | The invalid state is not exposed to the accessibility tree. AT cannot communicate "invalid entry" to the user. |
| No live region on error inject | **4.1.3 Status Messages** | When the error appears, screen reader users receive no announcement — they only discover the error if they happen to navigate back to the field. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          // Violations below are intentional — this story documents them
          { id: 'label', enabled: false },
          { id: 'label-content-name-mismatch', enabled: false },
        ],
      },
    },
  },
};
