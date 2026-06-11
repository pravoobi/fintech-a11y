import type { Meta, StoryObj } from '@storybook/react';
import React, { useRef, useState } from 'react';
import { OTPInput } from './OTPInput';

const meta: Meta<typeof OTPInput> = {
  title: 'Components/OTPInput',
  component: OTPInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant one-time passcode input for financial authentication flows.

**WCAG success criteria satisfied:**
- **3.3.8 Accessible Authentication (Minimum):** Paste is never blocked; \`autocomplete="one-time-code"\` enables platform SMS/OTP autofill; no cognitive-function test imposed.
- **4.1.3 Status Messages:** Code-complete announcement delivered via \`role="status"\` polite live region — no focus move.
- **2.5.8 Target Size (Minimum):** Each digit box is 48×48 CSS px (minimum is 24×24).
- **1.3.1 Info and Relationships:** Fields grouped in a \`<fieldset>\`/\`<legend>\`; each input individually labelled ("Digit N of 6").
- **3.3.1 / 3.3.2 Error Identification / Labels in Instructions:** Error text linked to every field via \`aria-describedby\`; \`aria-invalid="true"\` set; error surfaced as \`role="alert"\`.
- **1.4.1 Use of Color:** Error state uses an icon + text, not color alone.
- **1.4.3 / 1.4.11 Contrast:** Error colour (#dc2626 on white) = 5.74:1 — passes both text and non-text contrast.

**Keyboard map:**

| Key | Action |
|-----|--------|
| 0–9 | Enter digit, advance to next field |
| Backspace | Clear current digit; if empty, move to previous field |
| ArrowLeft | Move focus to previous field |
| ArrowRight | Move focus to next field |
| Paste (Ctrl/Cmd+V) | Distribute full code across all fields |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof OTPInput>;

export const Default: Story = {
  args: {
    label: 'One-time passcode',
    length: 6,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Accessible implementation. Try pasting a 6-digit code — it fills all fields. Completing the code announces "Code complete" via a polite live region without moving focus.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    label: 'One-time passcode',
    length: 6,
    errorMessage: 'Incorrect code. Please check your message and try again.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Error state: all fields are marked `aria-invalid="true"` and linked to the error via `aria-describedby`. The error is announced immediately by `role="alert"`. The icon + text means color is not the only error indicator (1.4.1).',
      },
    },
  },
};

export const FourDigit: Story = {
  args: {
    label: 'PIN',
    length: 4,
  },
  parameters: {
    docs: {
      description: {
        story: 'Four-digit variant — e.g. a PIN entry. Length is configurable; all a11y behaviour scales.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    label: 'One-time passcode',
    length: 6,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state — all fields are individually disabled so assistive technologies surface them correctly.',
      },
    },
  },
};

// ─── Common Mistake ────────────────────────────────────────────────────────────
// This story intentionally demonstrates inaccessible patterns found in the wild.
// axe violations here are EXPECTED and documented. Do not "fix" this component.

function InaccessibleOTPInput() {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    // ✗ Auto-submits silently with no live region announcement (fails 4.1.3)
    if (next.every(Boolean)) {
      console.log('submitted:', next.join(''));
    }
  }

  return (
    // ✗ No <fieldset>/<legend> or role="group" — fields have no group context (fails 1.3.1)
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          maxLength={1}
          value={digit}
          // ✗ No aria-label — screen reader announces nothing useful (fails 1.3.1, 4.1.2)
          // ✗ No autocomplete="one-time-code" — platform OTP autofill disabled (fails 3.3.8)
          autoComplete="off"
          style={{
            width: 40,
            height: 40,
            textAlign: 'center',
            fontSize: '1.25rem',
            border: '1px solid #ccc',
            borderRadius: 4,
          }}
          onChange={(e) => handleChange(index, e.target.value)}
          // ✗ Paste blocked — user cannot use password manager or SMS autofill (fails 3.3.8)
          onPaste={(e) => e.preventDefault()}
        />
      ))}
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessibleOTPInput />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

This version reproduces mistakes commonly seen in fintech OTP inputs:

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| No \`<fieldset>\`/\`<legend>\` or \`role="group"\` | **1.3.1 Info and Relationships** | Fields have no shared context — screen reader users cannot tell they belong to a single code entry. |
| No \`aria-label\` on each field | **1.3.1, 4.1.2 Name, Role, Value** | A screen reader announces the input but gives no positional info ("Digit 1 of 6"). |
| \`autocomplete="off"\` on all fields | **3.3.8 Accessible Authentication** | Platform OTP autofill (iOS, Android) requires \`autocomplete="one-time-code"\` on the first field. Disabling it forces manual transcription. |
| \`onPaste\` blocked via \`e.preventDefault()\` | **3.3.8 Accessible Authentication** | Blocks password managers and SMS autofill that paste the code as a string. Users who cannot type individual characters are stuck. |
| Silent auto-submit, no live region | **4.1.3 Status Messages** | Completion triggers a side-effect (console.log / API call) with no announcement. Screen reader users receive no feedback that anything happened. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          // Violations below are intentional — this story exists to demonstrate them
          { id: 'label', enabled: false },
          { id: 'label-content-name-mismatch', enabled: false },
        ],
      },
    },
  },
};
