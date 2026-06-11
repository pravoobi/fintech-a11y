import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Combobox } from './Combobox';
import type { ComboboxOption } from './Combobox';

const meta: Meta<typeof Combobox> = {
  title: 'Components/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant combobox (autocomplete) for financial-services applications — payee search, currency selection, account lookup, and similar filtering patterns.

**WCAG success criteria satisfied:**

- **1.3.1 Info and Relationships:** \`role="combobox"\` on the input; \`role="listbox"\` + \`role="option"\` on the dropdown — relationships are programmatically determinable.
- **1.4.1 Use of Color:** Highlighted option uses background + text color change together; selected option adds a ✓ mark — color is never the sole indicator.
- **1.4.3 Contrast (Minimum):** All text ≥ 4.5:1; highlighted option \`#1d4ed8\` = 7.37:1 ✓.
- **1.4.10 Reflow:** Single-column layout — no horizontal scroll at 320 CSS px.
- **2.1.1 Keyboard:** Fully operable — Tab to reach, Arrow keys to navigate, Enter to select, Escape to dismiss.
- **2.4.7 Focus Visible:** Focus ring on the input wrapper via \`:focus-within\`.
- **2.5.8 Target Size (Minimum):** Options are 44 CSS px tall — above the 24×24 minimum.
- **3.3.1 / 3.3.2 Error / Labels:** Error linked via \`aria-describedby\`; \`aria-invalid\` set; persistent visible \`<label>\`.
- **4.1.2 Name, Role, Value:** \`aria-expanded\`, \`aria-controls\`, \`aria-autocomplete\`, \`aria-activedescendant\` all maintained. Focus stays on the input throughout — AT tracks the highlighted option via \`aria-activedescendant\` without a focus move.
- **4.1.3 Status Messages:** Result count announced via polite live region — *"3 results available"* — on open and on filter.

**Keyboard map:**

| Key | Action |
|-----|--------|
| \`Tab\` | Move focus to the combobox |
| \`↓\` | Open the listbox / move highlight down |
| \`↑\` | Move highlight up / return to input from first option |
| \`Enter\` | Select the highlighted option |
| \`Escape\` | Close the listbox, revert query |
| \`Tab\` (while open) | Select highlighted option then move focus |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

// ─── Shared data ──────────────────────────────────────────────────────────────

const PAYEES: ComboboxOption[] = [
  { value: 'alice', label: 'Alice Johnson' },
  { value: 'bob', label: 'Bob Smith' },
  { value: 'carol', label: 'Carol White' },
  { value: 'david', label: 'David Lee' },
  { value: 'emma', label: 'Emma Davis' },
  { value: 'frank', label: 'Frank Miller' },
  { value: 'grace', label: 'Grace Wilson' },
];

const CURRENCIES: ComboboxOption[] = [
  { value: 'GBP', label: 'British pounds (GBP)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'USD', label: 'US dollars (USD)' },
  { value: 'JPY', label: 'Japanese yen (JPY)' },
  { value: 'CHF', label: 'Swiss franc (CHF)' },
  { value: 'AUD', label: 'Australian dollars (AUD)' },
  { value: 'CAD', label: 'Canadian dollars (CAD)' },
];

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: 'Payee',
    options: PAYEES,
    placeholder: 'Search payees…',
    hint: 'Select a saved payee or search by name.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Click or Tab into the field to open the listbox. Type to filter. Use ↓/↑ to navigate, Enter to select, Escape to dismiss. Screen readers hear `aria-activedescendant` updates — focus never leaves the input.',
      },
    },
  },
};

// ─── With error ───────────────────────────────────────────────────────────────

export const WithError: Story = {
  args: {
    label: 'Payee',
    options: PAYEES,
    placeholder: 'Search payees…',
    errorMessage: 'Please select a payee before continuing.',
  },
  parameters: {
    docs: {
      description: {
        story:
          '`aria-invalid="true"` on the input; error text linked via `aria-describedby`; ⚠ icon ensures color is not the sole indicator (1.4.1).',
      },
    },
  },
};

// ─── Currency selector ────────────────────────────────────────────────────────

export const CurrencySelector: Story = {
  args: {
    label: 'Destination currency',
    options: CURRENCIES,
    placeholder: 'Search currencies…',
    hint: 'The recipient will receive funds in this currency.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The same pattern applied to currency selection. Type "euro" or "GBP" — the filter matches anywhere in the label.',
      },
    },
  },
};

// ─── Controlled with validation ───────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>(undefined);
    const [error, setError] = useState('');
    const [touched, setTouched] = useState(false);

    function handleChange(v: string | undefined) {
      setValue(v);
      if (touched) {
        setError(v ? '' : 'Please select a payee before continuing.');
      }
    }

    function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setTouched(true);
      if (!value) {
        setError('Please select a payee before continuing.');
      } else {
        setError('');
        alert(`Transfer to: ${PAYEES.find((p) => p.value === value)?.label}`);
      }
    }

    return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Combobox
          label="Payee"
          options={PAYEES}
          value={value}
          onChange={handleChange}
          hint="Select a saved payee or search by name."
          errorMessage={error}
          required
          placeholder="Search payees…"
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
        {value && !error && (
          <p style={{ fontSize: '0.875rem', color: '#16a34a', margin: 0 }}>
            ✓ Sending to {PAYEES.find((p) => p.value === value)?.label}
          </p>
        )}
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Fully controlled — validation fires on submit and on subsequent changes. The polite live region announces the error without moving focus (4.1.3). Click Continue without selecting a payee to trigger the error state.',
      },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    label: 'Payee',
    options: PAYEES,
    value: 'alice',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state — the field is not editable and the clear button is hidden.',
      },
    },
  },
};

// ─── Common Mistake ────────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessibleCombobox() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('');

  const filtered = PAYEES.filter((p) =>
    p.label.toLowerCase().includes(query.toLowerCase())
  );

  function select(label: string) {
    setSelected(label);
    setQuery(label);
    setIsOpen(false);
  }

  return (
    // ✗ No <label> — placeholder only (fails 3.3.2, 1.3.1)
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        // ✗ No role="combobox", no aria-expanded, no aria-controls (fails 4.1.2)
        value={query}
        placeholder="Search payees…"
        onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        style={{
          width: '100%',
          padding: '0.625rem 0.75rem',
          border: '1.5px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '1rem',
          boxSizing: 'border-box',
        }}
      />

      {isOpen && filtered.length > 0 && (
        // ✗ Plain <div> — no role="listbox" (fails 1.3.1, 4.1.2)
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1.5px solid #d1d5db',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 100,
          }}
        >
          {filtered.map((p) => (
            // ✗ <div> with no role="option", no aria-selected (fails 1.3.1, 4.1.2)
            // ✗ Highlighted by background color only — no aria-activedescendant (fails 4.1.2, 1.4.1)
            <div
              key={p.value}
              onMouseDown={() => select(p.label)}
              style={{
                padding: '0.625rem 0.875rem',
                cursor: 'pointer',
                background: p.label === selected ? '#eff6ff' : 'transparent',
                fontSize: '0.9375rem',
              }}
            >
              {p.label}
            </div>
          ))}
          {/* ✗ No live region — AT never hears how many results are available (fails 4.1.3) */}
        </div>
      )}
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessibleCombobox />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

Tab to the input and open a screen reader — you will hear "edit" with no label, no role, and no announcement of available options. Use the keyboard to navigate the dropdown — it's impossible because the options are plain \`<div>\`s with mouse-only handlers.

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| No \`<label>\` — placeholder only | **3.3.2 Labels or Instructions**, **1.3.1** | Placeholder disappears on input; AT announces "edit" with no context. |
| No \`role="combobox"\`, no \`aria-expanded\` | **4.1.2 Name, Role, Value** | Screen readers don't know this is a combobox. \`aria-expanded\` state is never communicated — AT users don't know the dropdown is open. |
| No \`role="listbox"\` / \`role="option"\` | **1.3.1 Info and Relationships**, **4.1.2** | The dropdown is a flat \`<div>\` — AT cannot determine the structure or navigate the options. |
| No \`aria-activedescendant\` | **4.1.2 Name, Role, Value** | Focus stays on the input but AT has no way to know which option is highlighted. Users navigate blind. |
| Selection indicated by background color only | **1.4.1 Use of Color** | The selected item's blue background is the only visual indicator — fails for users with color blindness or high-contrast mode. |
| No live region | **4.1.3 Status Messages** | The number of filtered results is never announced — screen reader users don't know if their search found anything. |
| Options are \`<div>\` elements with \`onMouseDown\` only | **2.1.1 Keyboard** | Options cannot be activated by keyboard — Enter and Space do nothing. Keyboard-only users cannot select a payee at all. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'label', enabled: false },
          { id: 'aria-input-field-name', enabled: false },
        ],
      },
    },
  },
};
