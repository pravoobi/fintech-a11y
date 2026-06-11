import type { Meta, StoryObj } from '@storybook/react';
import React, { useRef, useState } from 'react';
import { PasswordInput } from './PasswordInput';

const meta: Meta<typeof PasswordInput> = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant password input with a show/hide toggle for financial-services login and registration forms.

**WCAG success criteria satisfied:**
- **2.1.1 Keyboard:** Input and toggle button are both fully keyboard operable.
- **2.4.7 Focus Visible:** 3px solid outline on \`:focus-visible\` for both input and toggle; focus never lost or moved unexpectedly.
- **2.5.3 Label in Name:** Toggle button visible text ("Show password" / "Hide password") is the accessible name — no mismatch between what is seen and what is announced.
- **2.5.8 Target Size (Minimum):** Toggle button is 44×44 CSS px — above the 24×24 minimum.
- **3.3.1 Error Identification:** Error text linked via \`aria-describedby\`; \`aria-invalid="true"\` set on the input.
- **3.3.2 Labels or Instructions:** Persistent visible \`<label>\`.
- **3.3.8 Accessible Authentication (Minimum):** Paste never blocked; \`autocomplete="current-password"\` / \`"new-password"\` enables password-manager autofill.
- **4.1.2 Name, Role, Value:** Toggle is a \`<button type="button">\` with \`aria-pressed\` reflecting shown/hidden state.
- **4.1.3 Status Messages:** Validation errors announced via persistent polite \`role="status"\` live region.

**Keyboard map:**

| Key | Action |
|-----|--------|
| Tab | Move focus to input, then to toggle button |
| Shift+Tab | Move focus in reverse |
| Enter / Space | Activate the toggle (show or hide password) |
| Ctrl/Cmd+V | Paste into the input — never blocked |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  args: {
    label: 'Password',
    autoComplete: 'current-password',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Login password field. Tab to the input, then Tab again to reach the toggle. Press Enter or Space on the toggle — focus stays on the button, it does not jump back to the input.',
      },
    },
  },
};

export const WithHint: Story = {
  args: {
    label: 'Password',
    hint: 'Must be at least 12 characters and include a number.',
    autoComplete: 'current-password',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Hint text linked via `aria-describedby` — screen readers announce it after the field label and role.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    hint: 'Must be at least 12 characters and include a number.',
    errorMessage: 'Password must be at least 12 characters.',
    defaultValue: 'short',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Error state: `aria-invalid="true"` set on the input; error linked via `aria-describedby`; polite live region announces the error without moving focus (4.1.3).',
      },
    },
  },
};

export const NewPassword: Story = {
  args: {
    label: 'Create a password',
    hint: 'Must be at least 12 characters and include a number.',
    autoComplete: 'new-password',
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Registration / change-password variant with `autocomplete="new-password"`. Password managers use this to offer to save the new credential (3.3.8).',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    label: 'Password',
    defaultValue: 'hidden-value',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Both the input and the toggle button are disabled together.',
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
      setError(v.length < 12 ? 'Password must be at least 12 characters.' : '');
    }

    return (
      <PasswordInput
        label="Create a password"
        hint="Must be at least 12 characters."
        autoComplete="new-password"
        value={value}
        errorMessage={error}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => validate(e.target.value)}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Live validation on blur. Type fewer than 12 characters and tab away — the polite live region announces the error without moving focus.',
      },
    },
  },
};

// ─── Common Mistake ────────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessiblePasswordInput() {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function toggle() {
    setVisible((v) => !v);
    // ✗ Moves focus back to the input on every toggle — keyboard users lose their place (fails 2.4.7)
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      {/* ✗ No <label> — placeholder only (fails 3.3.2, 1.3.1) */}
      <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '6px' }}>
        <input
          ref={inputRef}
          type={visible ? 'text' : 'password'}
          placeholder="Password"
          // ✗ Paste blocked — password managers cannot autofill (fails 3.3.8)
          onPaste={(e) => e.preventDefault()}
          // ✗ No autocomplete attribute — password managers may not recognize this field
          style={{ flex: 1, border: 'none', padding: '0.625rem', outline: 'none', fontSize: '1rem' }}
        />
        {/* ✗ Toggle is a <div> not a <button> — not keyboard operable (fails 2.1.1, 4.1.2)
            ✗ No accessible name — icon only with no text or aria-label (fails 2.5.3, 4.1.2)
            ✗ No aria-pressed — state not communicated to AT (fails 4.1.2) */}
        <div
          onClick={toggle}
          style={{ padding: '0 0.75rem', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          {visible ? '🙈' : '👁️'}
        </div>
      </div>
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessiblePasswordInput />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

This version reproduces mistakes commonly seen in fintech password inputs:

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| No \`<label>\` — placeholder only | **3.3.2 Labels or Instructions**, **1.3.1 Info and Relationships** | Placeholder disappears on input; AT may not consistently announce it; purpose cannot be determined programmatically. |
| Toggle is a \`<div>\`, not a \`<button>\` | **2.1.1 Keyboard**, **4.1.2 Name, Role, Value** | \`<div>\` elements are not in the tab order and cannot be activated by keyboard — keyboard-only users cannot toggle visibility. |
| Toggle has no accessible name (emoji only) | **2.5.3 Label in Name**, **4.1.2 Name, Role, Value** | An emoji has no reliable cross-platform text alternative. Screen readers announce it inconsistently or not at all. |
| No \`aria-pressed\` on the toggle | **4.1.2 Name, Role, Value** | The shown/hidden state is not exposed to the accessibility tree — AT users cannot determine the current state. |
| Focus moved to input after toggle | **2.4.7 Focus Visible** | Programmatically moving focus away from the toggle disorients keyboard and screen reader users who activated the button — they lose their position in the page. |
| Paste blocked via \`onPaste\` | **3.3.8 Accessible Authentication (Minimum)** | Prevents password managers from filling the field, forcing manual transcription — a cognitive burden and a barrier for users with motor impairments. |
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
