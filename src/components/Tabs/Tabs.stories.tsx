import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Tabs } from './Tabs';
import type { Tab } from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant tabs component implementing the [ARIA Authoring Practices Guide tablist pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) with automatic activation.

**WCAG success criteria satisfied:**

- **1.3.1 Info and Relationships:** \`role="tablist"\`, \`role="tab"\`, \`role="tabpanel"\` — structure is programmatically determinable. Each panel is linked to its tab via \`aria-controls\` / \`aria-labelledby\`.
- **1.4.1 Use of Color:** Active tab uses a bottom border + bold weight + \`aria-selected="true"\` — colour is never the sole indicator.
- **1.4.3 Contrast (Minimum):** Selected tab \`#2563eb\` on white = 5.92:1 ✓; default tab \`#6b7280\` on white = 4.6:1 ✓.
- **2.1.1 Keyboard:** Arrow keys navigate between tabs (APG pattern); Tab moves into and out of the tablist; Home/End reach first/last enabled tab; disabled tabs are skipped.
- **2.4.3 Focus Order:** Tab → selected tab → active panel — logical, sequential.
- **2.4.7 Focus Visible:** \`focus-visible\` ring (3px solid \`#2563eb\`) on tabs and panel.
- **2.5.8 Target Size (Minimum):** Each tab button is 44 CSS px tall.
- **4.1.2 Name, Role, Value:** \`aria-selected\`, \`aria-controls\`, \`aria-labelledby\`, \`tabIndex\` managed correctly; inactive panels carry \`hidden\`.

**Keyboard map:**

| Key | Action |
|-----|--------|
| \`Tab\` | Enter tablist at selected tab; move from tab to active panel |
| \`ArrowRight\` | Next tab (wraps; skips disabled) |
| \`ArrowLeft\` | Previous tab (wraps; skips disabled) |
| \`Home\` | First enabled tab |
| \`End\` | Last enabled tab |
| \`Tab\` (in panel) | Move through panel content normally |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    label: 'Account sections',
    tabs: [
      { id: 'overview',     label: 'Overview',     panel: <p>Overview panel content.</p> },
      { id: 'transactions', label: 'Transactions', panel: <p>Transactions panel content.</p> },
      { id: 'statements',   label: 'Statements',   panel: <p>Statements panel content.</p> },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Tab into the tablist — focus lands on the selected tab. Use ArrowRight/ArrowLeft to move between tabs (focus + activation together). Tab again to enter the panel. Inactive panels carry `hidden` — they are removed from the accessibility tree entirely.',
      },
    },
  },
};

// ─── With disabled tab ────────────────────────────────────────────────────────

export const WithDisabledTab: Story = {
  args: {
    label: 'Account sections',
    tabs: [
      { id: 'overview',     label: 'Overview',     panel: <p>Overview panel content.</p> },
      { id: 'transactions', label: 'Transactions', panel: <p>Transactions panel content.</p>, disabled: true },
      { id: 'statements',   label: 'Statements',   panel: <p>Statements panel content.</p> },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'The Transactions tab is disabled. ArrowRight from Overview skips directly to Statements; ArrowLeft from Statements skips directly back to Overview. The disabled tab is visually muted and not activatable by click or keyboard.',
      },
    },
  },
};

// ─── Financial account ────────────────────────────────────────────────────────

export const FinancialAccount: Story = {
  render: () => {
    const tabs: Tab[] = [
      {
        id: 'overview',
        label: 'Overview',
        panel: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem', margin: 0 }}>
              {[
                ['Account number', '12345678'],
                ['Sort code',      '20-00-00'],
                ['Balance',        '£4,250.00'],
                ['Available',      '£4,100.00'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>{label}</dt>
                  <dd style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ),
      },
      {
        id: 'transactions',
        label: 'Transactions',
        panel: (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th scope="col" style={{ textAlign: 'left', padding: '0.5rem 0', fontWeight: 600, color: '#374151' }}>Date</th>
                <th scope="col" style={{ textAlign: 'left', padding: '0.5rem 0', fontWeight: 600, color: '#374151' }}>Description</th>
                <th scope="col" style={{ textAlign: 'right', padding: '0.5rem 0', fontWeight: 600, color: '#374151' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['12 Jun', 'Direct debit — Utilities',  '−£85.00'],
                ['11 Jun', 'Faster payment — J. Smith', '−£200.00'],
                ['10 Jun', 'Salary',                    '+£2,450.00'],
              ].map(([date, desc, amount]) => (
                <tr key={desc} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.5rem 0', color: '#6b7280' }}>{date}</td>
                  <td style={{ padding: '0.5rem 0', color: '#1a1a1a' }}>{desc}</td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'right', color: amount.startsWith('+') ? '#16a34a' : '#1a1a1a' }}>{amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ),
      },
      {
        id: 'statements',
        label: 'Statements',
        panel: (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['May 2026', 'April 2026', 'March 2026'].map((month) => (
              <li key={month}>
                <a
                  href="#"
                  style={{ fontSize: '0.875rem', color: '#2563eb', textDecoration: 'underline' }}
                  onClick={(e) => e.preventDefault()}
                >
                  {month} statement (PDF)
                </a>
              </li>
            ))}
          </ul>
        ),
      },
    ];

    return <Tabs tabs={tabs} label="Current account" />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Realistic fintech tab set — account overview, transaction list, statement downloads. Tab into the tablist, arrow-key between sections, Tab into the panel to reach interactive content (links in Statements). The table in Transactions is a real `<table>` with `<th scope="col">` — not a `<div>` grid.',
      },
    },
  },
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [active, setActive] = useState('overview');
    const tabs: Tab[] = [
      { id: 'overview',     label: 'Overview',     panel: <p>Overview content.</p> },
      { id: 'transactions', label: 'Transactions', panel: <p>Transactions content.</p> },
      { id: 'statements',   label: 'Statements',   panel: <p>Statements content.</p> },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
          Active tab: <strong>{active}</strong>
        </p>
        <Tabs
          tabs={tabs}
          label="Account sections"
          defaultTab={active}
          onChange={setActive}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'The `onChange` callback fires on every tab activation — wire it to route changes, analytics, or parent state.',
      },
    },
  },
};

// ─── Common Mistake ───────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessibleTabs() {
  const [active, setActive] = useState('overview');
  const tabs = [
    { id: 'overview',     label: 'Overview',     content: 'Overview content.' },
    { id: 'transactions', label: 'Transactions', content: 'Transactions content.' },
    { id: 'statements',   label: 'Statements',   content: 'Statements content.' },
  ];

  return (
    // ✗ Plain <div> — no role="tablist", no accessible name (fails 1.3.1, 4.1.2)
    <div>
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb' }}>
        {tabs.map((tab) => (
          // ✗ <div> with onClick — not keyboard operable, no role="tab" (fails 2.1.1, 4.1.2)
          // ✗ Tab key navigates between these — breaks the standard tablist keyboard contract (fails 2.1.1)
          // ✗ Active state shown by color + underline only — no aria-selected (fails 1.4.1, 4.1.2)
          <div
            key={tab.id}
            tabIndex={0}
            onClick={() => setActive(tab.id)}
            onKeyDown={(e) => e.key === 'Enter' && setActive(tab.id)}
            style={{
              padding: '0.625rem 1.25rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: tab.id === active ? 700 : 400,
              color: tab.id === active ? '#2563eb' : '#6b7280',
              borderBottom: tab.id === active ? '3px solid #2563eb' : '3px solid transparent',
              marginBottom: '-2px',
              userSelect: 'none',
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>
      {/* ✗ No role="tabpanel", no aria-labelledby — panel not associated with tab (fails 1.3.1, 4.1.2) */}
      <div style={{ padding: '1rem 0', fontSize: '0.875rem' }}>
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessibleTabs />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| No \`role="tablist"\`, \`role="tab"\`, \`role="tabpanel"\` | **1.3.1 Info and Relationships**, **4.1.2 Name, Role, Value** | AT announces the tabs as a group of focusable divs — no tab semantics. Screen readers cannot use the virtual cursor's tab-navigation shortcut to jump between tab panels. |
| \`<div tabIndex={0}\` instead of \`<button role="tab"\` | **2.1.1 Keyboard** | Tab key moves between all three tab "buttons" — the standard ARIA pattern uses Tab to enter/leave the tablist, and arrow keys to navigate within it. This implementation breaks the expected keyboard contract. |
| No \`aria-selected\` | **4.1.2 Name, Role, Value** | Active tab is shown by colour and font weight only. AT has no programmatic way to determine which tab is selected. |
| No \`aria-controls\` / \`aria-labelledby\` | **4.1.2 Name, Role, Value** | The panel is not associated with its tab. AT cannot navigate directly from a tab to its panel or announce the panel's label. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'aria-required-children', enabled: false },
          { id: 'aria-required-parent',   enabled: false },
        ],
      },
    },
  },
};
