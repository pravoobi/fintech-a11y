import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ComboboxMulti } from './ComboboxMulti';
import type { ComboboxOption } from './ComboboxMulti';

// ─── Shared data ──────────────────────────────────────────────────────────────

const CURRENCIES: ComboboxOption[] = [
  { value: 'usd', label: 'US Dollar' },
  { value: 'eur', label: 'Euro' },
  { value: 'gbp', label: 'British Pound' },
  { value: 'jpy', label: 'Japanese Yen' },
  { value: 'cad', label: 'Canadian Dollar' },
  { value: 'aud', label: 'Australian Dollar' },
  { value: 'chf', label: 'Swiss Franc' },
  { value: 'hkd', label: 'Hong Kong Dollar' },
];

// ─── Controlled wrapper ───────────────────────────────────────────────────────

function Controlled(props: Omit<React.ComponentProps<typeof ComboboxMulti>, 'onChange'>) {
  const [value, setValue] = useState<string[]>(props.value ?? []);
  return <ComboboxMulti {...props} value={value} onChange={setValue} />;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof ComboboxMulti> = {
  title: 'Components/ComboboxMulti',
  component: ComboboxMulti,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Multi-select combobox with type-ahead filtering and removable tag chips.

**WCAG 2.2 AA criteria satisfied:**
- **1.3.1** Info & Relationships — \`role="listbox"\` + \`aria-multiselectable="true"\`; each option carries \`aria-selected\`.
- **1.4.1** Use of Color — selected state shown by checkmark glyph in a fixed-width slot, not color alone.
- **2.1.1** Keyboard — fully operable: Arrow keys navigate, Enter/Space toggle, Escape closes, Backspace removes the last tag when the query is empty.
- **2.5.3** Label in Name — visible label text is the accessible name of the combobox.
- **2.5.8** Target Size (Minimum) — tag Remove buttons meet the 24 × 24 CSS px minimum.
- **4.1.2** Name, Role, Value — input exposes \`role="combobox"\`, \`aria-expanded\`, \`aria-haspopup="listbox"\`, \`aria-autocomplete="list"\`, \`aria-controls\`, \`aria-activedescendant\`. The listbox carries \`aria-multiselectable\`.
- **4.1.3** Status Messages — selection changes announced via a \`role="status"\` / \`aria-live="polite"\` region ("Euro added. 2 items selected.").
        `.trim(),
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '480px', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ComboboxMulti>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: 'Default',
  parameters: {
    docs: {
      description: {
        story: `
**Keyboard map:**
| Key | Action |
|-----|--------|
| Tab / Shift+Tab | Move focus to/from the component |
| ArrowDown | Open listbox; move highlight down |
| ArrowUp | Move highlight up |
| Enter / Space | Toggle highlighted option |
| Escape | Close listbox, clear query |
| Backspace (empty query) | Remove the last selected tag |
| Click option | Toggle selection |
| Click × on tag | Remove that selection |
        `.trim(),
      },
    },
  },
  render: () => (
    <Controlled
      label="Accepted currencies"
      options={CURRENCIES}
      hint="Select all currencies your account supports."
    />
  ),
};

// ─── Pre-selected values ──────────────────────────────────────────────────────

export const WithPreselected: Story = {
  name: 'Pre-selected values',
  parameters: {
    docs: {
      description: {
        story: 'Starts with two values already selected, demonstrating the tag display and the running count in the live region on further changes.',
      },
    },
  },
  render: () => (
    <Controlled
      label="Accepted currencies"
      options={CURRENCIES}
      value={['usd', 'eur']}
    />
  ),
};

// ─── Required + error ─────────────────────────────────────────────────────────

export const WithError: Story = {
  name: 'Required + validation error',
  parameters: {
    docs: {
      description: {
        story: 'Error state: `aria-invalid="true"` on the input, error text linked via `aria-describedby`, non-text-contrast-compliant ⚠ icon (1.4.1).',
      },
    },
  },
  render: () => (
    <Controlled
      label="Accepted currencies"
      options={CURRENCIES}
      required
      errorMessage="Please select at least one currency."
    />
  ),
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  name: 'Disabled',
  render: () => (
    <ComboboxMulti
      label="Accepted currencies"
      options={CURRENCIES}
      value={['usd', 'gbp']}
      disabled
    />
  ),
};

// ─── Common mistake ───────────────────────────────────────────────────────────

/**
 * INTENTIONAL ACCESSIBILITY VIOLATIONS — documented for educational purposes.
 *
 * This story shows a multi-select built naively as a list of checkboxes inside
 * a `<div>` with no ARIA markup. Violations:
 *
 * • **4.1.2** — The "combobox" is a `<div>` with an `onClick`, not a real
 *   interactive element. Screen readers announce it as generic text.
 * • **1.3.1** — No `role="listbox"` / `aria-multiselectable`. Relationships
 *   between the trigger and the options are not programmatically determined.
 * • **4.1.3** — Selections change silently. No live region announces what was
 *   added or removed, so screen reader users receive no feedback.
 * • **1.4.1** — Selected items shown by background-color highlight only — no
 *   checkmark or other non-color indicator.
 * • **2.1.1** — The trigger and options are not keyboard-reachable beyond Tab
 *   (no arrow-key navigation, no Enter/Space activation).
 */
export const CommonMistake: Story = {
  name: 'Common Mistake — no ARIA, no live region',
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'aria-required-children', enabled: false },
          { id: 'aria-required-parent',   enabled: false },
          { id: 'listitem',               enabled: false },
          { id: 'aria-roles',             enabled: false },
        ],
      },
    },
    docs: {
      description: {
        story: `
**Intentional violations — do not copy this pattern.**

| Criterion | Failure |
|-----------|---------|
| 4.1.2 | Trigger is a \`<div>\` — not focusable or operable by keyboard |
| 1.3.1 | No \`role="listbox"\` / \`aria-multiselectable\` — relationships not programmatic |
| 4.1.3 | No live region — screen readers receive no feedback on selection changes |
| 1.4.1 | Selected state shown by background-color only — invisible in forced-colors mode |
| 2.1.1 | No arrow-key navigation; options only reachable by mouse |
        `.trim(),
      },
    },
  },
  render: function BrokenMultiSelect() {
    const [selected, setSelected] = useState<string[]>([]);
    const [open, setOpen] = useState(false);

    function toggle(value: string) {
      setSelected((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
      );
    }

    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', position: 'relative', width: 320 }}>
        <div style={{ marginBottom: 4, fontSize: 14, fontWeight: 600 }}>
          {/* No <label> associated to a real input */}
          Accepted currencies
        </div>

        {/* div trigger — not keyboard operable */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          onClick={() => setOpen((o) => !o)}
          style={{
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '8px 12px',
            cursor: 'pointer',
            background: '#fff',
            minHeight: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          {selected.length === 0 ? (
            <span style={{ color: '#9ca3af' }}>Select currencies</span>
          ) : (
            selected.map((v) => {
              const opt = CURRENCIES.find((c) => c.value === v);
              return (
                <span
                  key={v}
                  style={{
                    /* Color-only selected indicator */
                    background: '#bfdbfe',
                    padding: '2px 8px',
                    borderRadius: 3,
                    fontSize: 13,
                  }}
                >
                  {opt?.label}
                </span>
              );
            })
          )}
        </div>

        {open && (
          /* No role="listbox", no aria-multiselectable */
          <ul
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              margin: '2px 0 0',
              padding: '4px 0',
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: 4,
              listStyle: 'none',
              zIndex: 100,
            }}
          >
            {CURRENCIES.map((opt) => (
              /* No role="option", no aria-selected */
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <li
                key={opt.value}
                onClick={() => toggle(opt.value)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  /* Color-only selected state */
                  background: selected.includes(opt.value) ? '#eff6ff' : 'transparent',
                  fontSize: 14,
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
        {/* No live region — selection changes go unannounced */}
      </div>
    );
  },
};
