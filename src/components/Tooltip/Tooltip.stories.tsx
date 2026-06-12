import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Tooltip } from './Tooltip';
import type { TooltipPlacement } from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant tooltip implementing the [ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/). Triggered on both hover and keyboard focus. Dismissible with Escape. Hoverable.

**WCAG success criteria satisfied:**

- **1.3.1 Info and Relationships:** \`role="tooltip"\` + \`aria-describedby\` — the supplementary description is programmatically associated with the trigger.
- **1.4.3 Contrast (Minimum):** Tooltip text \`#ffffff\` on \`#1a1a1a\` = 18.1:1 ✓.
- **1.4.13 Content on Hover or Focus:** All three requirements met:
  - **Dismissible** — Escape hides the tooltip without moving focus.
  - **Hoverable** — the pointer can move from the trigger over the tooltip without it disappearing (100 ms hide delay on the outer wrapper).
  - **Persistent** — tooltip stays visible until focus/pointer leaves or Escape is pressed.
- **2.1.1 Keyboard:** Tooltip appears on focus and is dismissed by Escape; focus never leaves the trigger.
- **4.1.2 Name, Role, Value:** \`role="tooltip"\` on the bubble; \`aria-describedby\` on the trigger pointing to the tooltip id.

**Important:** Tooltips provide *supplementary* information only. Critical information (what a field is, what a button does) must appear in the visible label — never exclusively in a tooltip. Users on touch devices, keyboard-only users relying on screen readers, and users with cognitive disabilities may not discover or read the tooltip.

**Keyboard map:**

| Key | Action |
|-----|--------|
| \`Tab\` | Move focus to the trigger — tooltip appears |
| \`Escape\` | Dismiss tooltip — focus stays on trigger |
| \`Shift+Tab\` | Move focus away — tooltip disappears |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div style={{ padding: '4rem 2rem' }}>
      <Tooltip content="A sort code is the 6-digit number that identifies your bank and branch. You'll find it on your debit card and bank statements.">
        <button
          type="button"
          style={{
            background: 'none',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            cursor: 'pointer',
            color: '#2563eb',
          }}
        >
          What is a sort code?
        </button>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Hover over the button or Tab to focus it — the tooltip appears. Press Escape to dismiss without moving focus. The tooltip stays visible when the pointer moves from the trigger onto the bubble (1.4.13 — Hoverable).',
      },
    },
  },
};

// ─── All placements ───────────────────────────────────────────────────────────

export const AllPlacements: Story = {
  render: () => {
    const placements: TooltipPlacement[] = ['top', 'bottom', 'left', 'right'];
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem 2rem',
          padding: '3rem',
        }}
      >
        {placements.map((placement) => (
          <div key={placement} style={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip
              content={`Tooltip positioned ${placement}.`}
              placement={placement}
            >
              <button
                type="button"
                style={{
                  background: 'none',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                {placement}
              </button>
            </Tooltip>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'All four placements. Hover or focus each button to verify the arrow points toward the trigger.',
      },
    },
  },
};

// ─── On a form field info icon ────────────────────────────────────────────────

export const OnFormField: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const fieldId   = 'sort-code';
    const hintId    = 'sort-code-hint';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '20rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <label
            htmlFor={fieldId}
            style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a' }}
          >
            Sort code
          </label>
          {/* Info icon button — tooltip provides supplementary explanation */}
          <Tooltip
            content="Your sort code is the 6-digit number on the front of your debit card, formatted as XX-XX-XX."
            placement="right"
          >
            <button
              type="button"
              aria-label="Sort code — more information"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.25rem',
                height: '1.25rem',
                borderRadius: '50%',
                border: '1.5px solid #6b7280',
                background: 'transparent',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#6b7280',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
            >
              i
            </button>
          </Tooltip>
        </div>
        <p id={hintId} style={{ fontSize: '0.8125rem', color: '#6b7280', margin: 0 }}>
          For example, 20-00-00
        </p>
        <input
          id={fieldId}
          type="text"
          inputMode="numeric"
          aria-describedby={hintId}
          placeholder="00-00-00"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            padding: '0.625rem 0.75rem',
            border: '1.5px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '1rem',
            width: '100%',
          }}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Common fintech pattern — a labelled info icon next to a field label. The field label ("Sort code") and hint ("For example, 20-00-00") are the primary sources of information; the tooltip supplements with additional context. The info button has its own accessible name ("Sort code — more information") independent of the tooltip.',
      },
    },
  },
};

// ─── Common Mistake ───────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessibleTooltip() {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ padding: '4rem 2rem' }}>
      {/* ✗ Wrapper only handles mouse — keyboard users never see the tooltip (fails 2.1.1, 1.4.13) */}
      <div
        style={{ display: 'inline-block', position: 'relative' }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        <button
          type="button"
          // ✗ No aria-describedby — AT cannot associate tooltip content with trigger (fails 4.1.2)
          style={{
            background: 'none',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            cursor: 'pointer',
            color: '#2563eb',
          }}
        >
          Minimum balance
        </button>

        {visible && (
          // ✗ No role="tooltip" — AT does not know this is a tooltip (fails 4.1.2)
          // ✗ Critical information only in tooltip — keyboard/touch users will miss it (fails 1.3.1)
          // ✗ Not dismissible with Escape — no keyboard handler (fails 1.4.13, 2.1.1)
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1a1a1a',
              color: '#ffffff',
              fontSize: '0.8125rem',
              padding: '0.375rem 0.625rem',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              zIndex: 100,
            }}
          >
            You must maintain £500 to avoid the £12 monthly fee.
          </div>
        )}
      </div>
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessibleTooltip />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

Tab to the "Minimum balance" button — the tooltip never appears. Keyboard users and screen reader users never learn about the £500 minimum or the £12 fee.

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| Tooltip only on \`mouseenter\` | **2.1.1 Keyboard**, **1.4.13 Content on Hover or Focus** | Keyboard and touch users never see the tooltip. Any information in it is inaccessible to them. |
| No \`role="tooltip"\` | **4.1.2 Name, Role, Value** | AT does not identify this as a tooltip and does not associate it with the trigger. |
| No \`aria-describedby\` on trigger | **4.1.2 Name, Role, Value** | Even if a screen reader user somehow triggered the hover, AT has no programmatic link between the button and the tooltip text. |
| No Escape to dismiss | **1.4.13 Content on Hover or Focus** | The tooltip cannot be dismissed without moving the pointer — violates the Dismissible requirement. |
| Critical fee information only in tooltip | **1.3.1 Info and Relationships** | The £500 minimum and £12 fee are material to the user's decision. Hiding them exclusively in a hover tooltip means keyboard users and touch users make decisions without the full picture. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'duplicate-id-aria', enabled: false },
        ],
      },
    },
  },
};
