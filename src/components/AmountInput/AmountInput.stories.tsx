import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { AmountInput } from './AmountInput';

const meta: Meta<typeof AmountInput> = {
  title: 'Components/AmountInput',
  component: AmountInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant currency amount input for financial-services applications.

**WCAG success criteria satisfied:**
- **1.3.1 Info and Relationships:** Currency unit conveyed to AT via a visually-hidden description linked with \`aria-describedby\` — the \`$\` symbol is \`aria-hidden\` so AT is not left with a bare number.
- **1.4.1 Use of Color:** Error state uses icon + text alongside the border change.
- **1.4.3 Contrast (Minimum):** All text ≥ 4.5:1; currency symbol and hint (#6b7280) = 4.6:1.
- **1.4.11 Non-text Contrast:** Focus ring and error border (#dc2626) both ≥ 3:1.
- **2.1.1 Keyboard:** Fully operable by keyboard; format-on-blur never traps or jumps the caret.
- **2.4.7 Focus Visible:** 3px inset outline on \`:focus-visible\`.
- **2.5.8 Target Size:** Input height ≥ 44px CSS.
- **3.3.1 / 3.3.2 Error / Labels:** Error linked via \`aria-describedby\`; \`aria-invalid\` set; persistent visible label.
- **4.1.2 Name, Role, Value:** Accessible name from label; \`aria-invalid\` reflects error state.
- **4.1.3 Status Messages:** Validation errors announced via persistent polite \`role="status"\` live region.

**Keyboard map:**

| Key | Action |
|-----|--------|
| Tab | Move focus to the input |
| 0–9, . | Enter amount |
| Blur (Tab away) | Formats value — e.g. \`1234.5\` → \`1,234.50\` |
| Focus (Tab back) | Strips formatting for editing — \`1,234.50\` → \`1234.50\` |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AmountInput>;

export const Default: Story = {
  args: {
    label: 'Transfer amount',
    currencySymbol: '$',
    currencyLabel: 'US dollars',
    placeholder: '0.00',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Type a number and tab away — the value formats with thousands separators. Tab back in and the commas are stripped for clean editing. The `$` symbol is `aria-hidden`; screen readers hear "US dollars" via `aria-describedby`.',
      },
    },
  },
};

export const WithHint: Story = {
  args: {
    label: 'Transfer amount',
    currencySymbol: '$',
    currencyLabel: 'US dollars',
    hint: 'Maximum transfer is $10,000.00 per day.',
    placeholder: '0.00',
  },
  parameters: {
    docs: {
      description: {
        story: 'Hint text linked via `aria-describedby` alongside the currency description.',
      },
    },
  },
};

export const WithError: Story = {
  args: {
    label: 'Transfer amount',
    currencySymbol: '$',
    currencyLabel: 'US dollars',
    hint: 'Maximum transfer is $10,000.00 per day.',
    errorMessage: 'Amount exceeds your daily transfer limit of $10,000.00.',
    value: 15000,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Error state: `aria-invalid="true"` on the input; error linked via `aria-describedby`; polite live region announces the error without focus move (4.1.3).',
      },
    },
  },
};

export const GBP: Story = {
  args: {
    label: 'Payment amount',
    currencySymbol: '£',
    currencyLabel: 'British pounds',
    hint: 'Enter the amount you wish to pay.',
    placeholder: '0.00',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Non-USD currency — the `currencyLabel` prop ensures AT announces "British pounds" regardless of the symbol used.',
      },
    },
  },
};

export const Required: Story = {
  args: {
    label: 'Deposit amount',
    currencySymbol: '$',
    currencyLabel: 'US dollars',
    required: true,
    placeholder: '0.00',
  },
  parameters: {
    docs: {
      description: {
        story: 'Required field — the `required` attribute communicates the constraint to AT; the visual asterisk is `aria-hidden`.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    label: 'Transfer amount',
    currencySymbol: '$',
    currencyLabel: 'US dollars',
    value: 2500,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state — input is not editable; label and symbol are visually muted.',
      },
    },
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<number | undefined>(undefined);
    const [error, setError] = useState('');

    function handleChange(v: number | undefined) {
      setValue(v);
      if (v === undefined || v <= 0) {
        setError('Enter an amount greater than $0.00.');
      } else if (v > 10000) {
        setError('Amount exceeds your daily transfer limit of $10,000.00.');
      } else {
        setError('');
      }
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AmountInput
          label="Transfer amount"
          currencySymbol="$"
          currencyLabel="US dollars"
          hint="Maximum transfer is $10,000.00 per day."
          value={value}
          errorMessage={error}
          onChange={handleChange}
          required
        />
        {value !== undefined && !error && (
          <p style={{ fontSize: '0.875rem', color: '#16a34a', margin: 0 }}>
            ✓ Transferring ${value.toFixed(2)}
          </p>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Controlled with live validation on blur. Enter an amount over $10,000 or leave empty to trigger errors. The polite live region announces each error without moving focus.',
      },
    },
  },
};

// ─── Common Mistake ────────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessibleAmountInput() {
  const [value, setValue] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    // ✗ Formats on every keystroke — caret jumps to the end on each character typed
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      setValue(
        new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(num)
      );
    } else {
      setValue(raw);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      {/* ✗ No <label> — placeholder only (fails 3.3.2, 1.3.1) */}
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '6px', padding: '0 0.75rem' }}>
        {/* ✗ $ symbol has no aria-hidden and no hidden text alternative —
            screen readers announce a bare number with no currency unit (fails 1.3.1) */}
        <span style={{ color: '#374151', fontWeight: 600, marginRight: '0.25rem' }}>$</span>
        <input
          type="text"
          value={value}
          placeholder="Amount"
          onChange={handleChange}
          style={{ border: 'none', outline: 'none', fontSize: '1rem', flex: 1, padding: '0.625rem 0', textAlign: 'right' }}
        />
      </div>
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessibleAmountInput />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

Try typing a number (e.g. "1234") — the caret jumps to the end on each keystroke because formatting is applied during input. This version reproduces mistakes commonly seen in fintech amount inputs:

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| No \`<label>\` — placeholder only | **3.3.2 Labels or Instructions**, **1.3.1 Info and Relationships** | Placeholder disappears on input; field purpose cannot be programmatically determined. |
| \`$\` symbol has no \`aria-hidden\` and no hidden text alternative | **1.3.1 Info and Relationships** | Screen readers encounter the \`$\` character inconsistently — some announce "dollar sign", others skip it. The currency unit is never reliably communicated. A bare number with no unit is ambiguous (dollars? pence? points?). |
| Format applied on every keystroke | **2.1.1 Keyboard** | Thousands separators are inserted mid-typing, causing the caret to jump to the end of the input on each keystroke. Keyboard-only users cannot edit amounts without fighting the formatter. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'label', enabled: false },
          { id: 'label-content-name-mismatch', enabled: false },
        ],
      },
    },
  },
};
