import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Accordion } from './Accordion';
import type { AccordionItem } from './Accordion';

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant accordion component implementing the [ARIA Authoring Practices Guide disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/). Used in financial-services UIs for FAQs, fee schedules, terms sections, and settings panels.

**WCAG success criteria satisfied:**

- **1.3.1 Info and Relationships:** Each trigger is wrapped in a heading element (level configurable via \`headingLevel\`) so screen reader users can navigate the accordion via heading shortcuts. \`role="region"\` + \`aria-labelledby\` on each panel provides a named landmark.
- **1.4.1 Use of Color:** Expanded state communicated via \`aria-expanded\` + chevron rotation + background tint — never colour alone.
- **1.4.3 Contrast (Minimum):** Trigger text \`#1a1a1a\` on white = 18.1:1 ✓; panel text \`#374151\` on white = 8.6:1 ✓.
- **2.1.1 Keyboard:** All triggers reachable by Tab; Enter and Space activate; no arrow-key requirement (accordion differs from tablist).
- **2.4.7 Focus Visible:** \`focus-visible\` inset ring (3px solid \`#2563eb\`) on each trigger.
- **2.5.8 Target Size (Minimum):** Each trigger is 44 CSS px tall — above the 24×24 minimum.
- **4.1.2 Name, Role, Value:** \`aria-expanded\` reflects open/closed state; \`aria-controls\` links trigger to panel; \`aria-labelledby\` links panel back to trigger.

**Keyboard map:**

| Key | Action |
|-----|--------|
| \`Tab\` | Move focus to next trigger |
| \`Shift+Tab\` | Move focus to previous trigger |
| \`Enter\` / \`Space\` | Toggle the focused item open/closed |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const FAQ_ITEMS: AccordionItem[] = [
  {
    id: 'fees',
    heading: 'What are the account fees?',
    panel: (
      <p>
        Standard current accounts have no monthly fee. Our Premium account costs £9.99/month and
        includes worldwide travel insurance and a preferential savings rate.
      </p>
    ),
  },
  {
    id: 'limits',
    heading: 'What are the transfer limits?',
    panel: (
      <>
        <p>Daily transfer limits depend on your account type:</p>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>Standard: £10,000 per day</li>
          <li>Premium: £25,000 per day</li>
          <li>Business: £50,000 per day</li>
        </ul>
      </>
    ),
  },
  {
    id: 'interest',
    heading: 'How is interest calculated?',
    panel: (
      <p>
        Interest is calculated on your daily closing balance and credited to your account on the
        last working day of each month. The current AER is 3.25% (variable).
      </p>
    ),
  },
  {
    id: 'disputes',
    heading: 'How do I dispute a transaction?',
    panel: (
      <p>
        To dispute a transaction, go to <strong>Payments → Transaction history</strong>, select the
        transaction, and tap <strong>Dispute this payment</strong>. We aim to resolve disputes within
        5 working days. For urgent cases call 0800 000 0000 (free, 24/7).
      </p>
    ),
  },
];

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    items: FAQ_ITEMS.slice(0, 3),
  },
  parameters: {
    docs: {
      description: {
        story:
          'All items closed by default. Tab through triggers — each is a separate tab stop. Enter or Space opens an item; opening a second item closes the first (`allowMultiple={false}`).',
      },
    },
  },
};

// ─── Default open ─────────────────────────────────────────────────────────────

export const DefaultOpen: Story = {
  args: {
    items: FAQ_ITEMS.slice(0, 3),
    defaultOpen: ['fees'],
  },
  parameters: {
    docs: {
      description: {
        story:
          'The first item is open on first render via `defaultOpen`. `aria-expanded="true"` is set immediately — AT announces the expanded state when the trigger is focused.',
      },
    },
  },
};

// ─── Allow multiple ───────────────────────────────────────────────────────────

export const AllowMultiple: Story = {
  args: {
    items: FAQ_ITEMS,
    allowMultiple: true,
    defaultOpen: ['fees', 'interest'],
  },
  parameters: {
    docs: {
      description: {
        story:
          '`allowMultiple={true}` — opening one item does not close others. Two items start open via `defaultOpen`. Each trigger independently toggles its own panel.',
      },
    },
  },
};

// ─── Financial FAQ ────────────────────────────────────────────────────────────

export const FinancialFAQ: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1a1a1a' }}>
        Frequently asked questions
      </h2>
      <Accordion items={FAQ_ITEMS} headingLevel={3} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Realistic fintech FAQ. The page heading is `<h2>`, so `headingLevel={3}` keeps the hierarchy correct — screen reader users navigating by headings hear "Frequently asked questions" then each FAQ item as an `<h3>`. Panels use `role="region"` + `aria-labelledby` so they appear as named landmarks.',
      },
    },
  },
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [log, setLog] = useState<string[]>([]);

    const items: AccordionItem[] = FAQ_ITEMS.slice(0, 3).map((item) => ({
      ...item,
      heading: item.heading,
    }));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Accordion
          items={items}
          allowMultiple
          defaultOpen={[]}
        />
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280' }}>
          (Expand items above — wire \`onChange\` to track which are open)
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Multi-open variant ready to wire to external state or analytics via `onChange` (not yet a prop — open state is internal). Add `onChange` to the component if you need to lift state.',
      },
    },
  },
};

// ─── Common Mistake ───────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessibleAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);
  const items = FAQ_ITEMS.slice(0, 3);

  return (
    <div style={{ border: '1.5px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
      {items.map((item) => {
        const isOpen = item.id === openId;
        return (
          <div key={item.id} style={{ borderBottom: '1.5px solid #e5e7eb' }}>
            {/*
              ✗ <div> with onClick — not a button, not in the tab order (fails 2.1.1, 4.1.2)
              ✗ No aria-expanded — AT cannot tell if the item is open or closed (fails 4.1.2)
              ✗ No aria-controls — panel not associated with trigger (fails 4.1.2)
              ✗ No heading wrapper — screen reader users cannot navigate by headings (fails 1.3.1)
              ✗ Open/closed shown by chevron rotation + color only — no semantic state (fails 1.4.1)
            */}
            <div
              onClick={() => setOpenId(isOpen ? null : item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                background: isOpen ? '#f9fafb' : '#ffffff',
                // ✗ Color change is the only additional indicator beyond the chevron
                color: isOpen ? '#2563eb' : '#1a1a1a',
                fontWeight: 600,
                fontSize: '0.9375rem',
                userSelect: 'none',
              }}
            >
              {item.heading}
              <span
                style={{
                  transform: isOpen ? 'rotate(270deg)' : 'rotate(90deg)',
                  transition: 'transform 0.2s',
                  display: 'inline-block',
                  fontSize: '1.125rem',
                  color: '#6b7280',
                }}
              >
                ›
              </span>
            </div>
            {/* ✗ No role="region", no aria-labelledby — panel has no landmark or label (fails 1.3.1) */}
            {isOpen && (
              <div style={{ padding: '0.75rem 1rem 1rem', fontSize: '0.875rem', color: '#374151', borderTop: '1.5px solid #e5e7eb' }}>
                {item.panel}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessibleAccordion />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

Tab through the accordion — nothing receives focus. The items are invisible to keyboard users.

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| \`<div onClick>\` instead of \`<button>\` | **2.1.1 Keyboard**, **4.1.2 Name, Role, Value** | \`<div>\` is not in the tab order and has no implicit role. Keyboard users cannot reach or activate the accordion at all. |
| No \`aria-expanded\` | **4.1.2 Name, Role, Value** | AT cannot determine whether an item is open or closed. A screen reader user hears the trigger label but gets no state. |
| No \`aria-controls\` | **4.1.2 Name, Role, Value** | There is no programmatic link between the trigger and its panel. AT users cannot navigate directly from the trigger to the panel content. |
| No heading wrapper | **1.3.1 Info and Relationships** | Screen reader users who navigate by headings (a very common pattern for skimming a page) cannot find the accordion items. |
| Open state by colour + chevron only | **1.4.1 Use of Color** | The blue text colour signals the open item — but without \`aria-expanded\`, a user who cannot perceive colour has no way to determine state. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'region', enabled: false },
        ],
      },
    },
  },
};
