import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { DataTable } from './DataTable';
import type { DataTableColumn, DataTableRow, SortState } from './DataTable';

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant sortable data table for financial-services applications.

**WCAG success criteria satisfied:**

- **1.3.1 Info and Relationships:** Real \`<table>\` with \`<th scope="col">\` headers and a visible \`<caption>\` — relationships between headers and cells are programmatically determinable.
- **1.4.1 Use of Color:** Sort direction indicated by icon shape change (↑/↓) and \`aria-sort\` — color is never the sole indicator.
- **1.4.3 Contrast (Minimum):** Header text \`#374151\` = 10.7:1 ✓; active sort \`#1d4ed8\` = 7.37:1 ✓; body text \`#374151\` = 10.7:1 ✓.
- **1.4.10 Reflow:** Horizontal scroll on narrow viewports — the scroll container is keyboard-reachable (\`tabIndex={0}\`); no content lost at 320 CSS px.
- **2.1.1 Keyboard:** Sort buttons are real \`<button>\` elements — reachable and activatable by keyboard.
- **2.4.7 Focus Visible:** Inset \`focus-visible\` ring on sort buttons; outline on the scroll container.
- **2.5.8 Target Size (Minimum):** Sort buttons are 44px tall and fill the full header cell width.
- **4.1.2 Name, Role, Value:** \`aria-sort\` on \`<th>\` reflects current sort state (\`none\` / \`ascending\` / \`descending\`).
- **4.1.3 Status Messages:** Sort changes announced via a persistent polite \`role="status"\` live region — no focus movement required.

**Keyboard map:**

| Key | Action |
|-----|--------|
| \`Tab\` | Move focus to the next sort button (or scroll container) |
| \`Enter\` / \`Space\` | Activate the focused sort button |
| Arrow keys | Scroll the table container when it has focus |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DataTable>;

// ─── Shared data ──────────────────────────────────────────────────────────────

const TRANSACTION_COLUMNS: DataTableColumn[] = [
  { key: 'payee', label: 'Payee', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
  { key: 'status', label: 'Status' },
];

const TRANSACTION_ROWS: DataTableRow[] = [
  { id: 1, payee: 'Alice Johnson', date: '2026-06-01', category: 'Transfer', amount: '$1,200.00', status: 'Completed' },
  { id: 2, payee: 'Bob Smith', date: '2026-06-03', category: 'Payment', amount: '$450.50', status: 'Pending' },
  { id: 3, payee: 'Carol White', date: '2026-05-28', category: 'Transfer', amount: '$8,750.00', status: 'Completed' },
  { id: 4, payee: 'David Lee', date: '2026-05-30', category: 'Refund', amount: '$99.99', status: 'Completed' },
  { id: 5, payee: 'Emma Davis', date: '2026-06-04', category: 'Payment', amount: '$3,200.00', status: 'Processing' },
];

// ─── Default (uncontrolled) ───────────────────────────────────────────────────

export const Default: Story = {
  args: {
    caption: 'Recent transactions',
    columns: TRANSACTION_COLUMNS,
    rows: TRANSACTION_ROWS,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uncontrolled — the table manages its own sort state internally. Click any sortable column header (Payee, Date, Amount) to sort. A polite live region announces the sort change without moving focus. Screen readers hear `aria-sort` on the active header.',
      },
    },
  },
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [sortState, setSortState] = useState<SortState>({
      key: 'date',
      direction: 'descending',
    });

    const sorted = [...TRANSACTION_ROWS].sort((a, b) => {
      const aVal = String(a[sortState.key] ?? '');
      const bVal = String(b[sortState.key] ?? '');
      const cmp = aVal.localeCompare(bVal);
      return sortState.direction === 'ascending' ? cmp : -cmp;
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <DataTable
          caption="Recent transactions"
          columns={TRANSACTION_COLUMNS}
          rows={sorted}
          sortState={sortState}
          onSort={setSortState}
        />
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280' }}>
          Sorted by: <strong>{sortState.key}</strong> ({sortState.direction})
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Fully controlled — the parent owns sort state and sorts rows before passing them in. The current sort column and direction are shown below the table. `aria-sort` and the live region always reflect the controlled state.',
      },
    },
  },
};

// ─── Many columns (horizontal scroll) ────────────────────────────────────────

export const HorizontalScroll: Story = {
  render: () => {
    const columns: DataTableColumn[] = [
      { key: 'id', label: 'Ref', sortable: true },
      { key: 'payee', label: 'Payee', sortable: true },
      { key: 'accountNumber', label: 'Account number' },
      { key: 'sortCode', label: 'Sort code' },
      { key: 'date', label: 'Date', sortable: true },
      { key: 'valueDate', label: 'Value date' },
      { key: 'currency', label: 'Currency' },
      { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
      { key: 'fee', label: 'Fee', align: 'right' },
      { key: 'status', label: 'Status' },
    ];

    const rows: DataTableRow[] = Array.from({ length: 5 }, (_, i) => ({
      id: `TXN-${1000 + i}`,
      payee: ['Alice Johnson', 'Bob Smith', 'Carol White', 'David Lee', 'Emma Davis'][i],
      accountNumber: `${12345678 + i * 111111}`,
      sortCode: '20-00-00',
      date: `2026-06-0${i + 1}`,
      valueDate: `2026-06-0${i + 2}`,
      currency: 'GBP',
      amount: `£${(1000 + i * 750).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`,
      fee: `£${(2.5 + i * 0.5).toFixed(2)}`,
      status: i % 2 === 0 ? 'Completed' : 'Pending',
    }));

    return <DataTable caption="Transaction history" columns={columns} rows={rows} />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Wide table with many columns — overflows horizontally. The scroll container has `tabIndex={0}` so keyboard users can focus it and scroll with arrow keys. Resize the viewport to below 480 px to see the narrow layout.',
      },
    },
  },
};

// ─── Common Mistake ────────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessibleDataTable() {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const cols = ['Payee', 'Date', 'Amount', 'Status'];

  function handleSort(col: string) {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  }

  return (
    // ✗ <div> grid — no table semantics; AT cannot determine row/column relationships (fails 1.3.1)
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', fontSize: '0.875rem' }}>
      {/* ✗ No <caption> — table has no accessible name */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
        {cols.map((col) => (
          // ✗ Click handler on a <div> — not keyboard operable; not a button (fails 2.1.1, 4.1.2)
          // ✗ No aria-sort — sort direction not communicated to AT (fails 4.1.2)
          // ✗ Sort direction shown only by color change — fails 1.4.1
          <div
            key={col}
            onClick={() => handleSort(col)}
            style={{
              padding: '0.75rem 1rem',
              fontWeight: 600,
              cursor: 'pointer',
              // ✗ Color alone signals which column is sorted
              color: sortCol === col ? '#2563eb' : '#374151',
              userSelect: 'none',
            }}
          >
            {col}
          </div>
        ))}
      </div>
      {TRANSACTION_ROWS.map((row) => (
        <div
          key={row.id}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #e5e7eb' }}
        >
          {/* ✗ Data cells are plain <div>s — no row/cell semantics */}
          <div style={{ padding: '0.75rem 1rem' }}>{String(row.payee)}</div>
          <div style={{ padding: '0.75rem 1rem' }}>{String(row.date)}</div>
          <div style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{String(row.amount)}</div>
          <div style={{ padding: '0.75rem 1rem' }}>{String(row.status)}</div>
        </div>
      ))}
      {/* ✗ No live region — sort changes are silent to AT (fails 4.1.3) */}
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessibleDataTable />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

Click a column header to "sort" — Tab through the page and notice the sort headers are not reachable by keyboard. Screen readers hear only a flat list of text with no row or column structure.

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| \`<div>\`-based grid instead of \`<table>\` | **1.3.1 Info and Relationships** | AT cannot determine the relationship between header cells and data cells. Screen readers announce a flat stream of text — users cannot navigate by column or row. |
| No \`<caption>\` or accessible name | **1.3.1 Info and Relationships** | The table's purpose cannot be programmatically determined. |
| Sort triggered by click on a \`<div>\` | **2.1.1 Keyboard**, **4.1.2 Name, Role, Value** | \`<div>\` elements are not in the tab order and have no implicit keyboard activation. Keyboard-only users cannot sort the table at all. |
| No \`aria-sort\` | **4.1.2 Name, Role, Value** | Screen readers cannot announce which column is sorted or in which direction. Users must rely solely on visual color change. |
| Sort direction conveyed by color alone | **1.4.1 Use of Color** | Users with color blindness or high-contrast mode cannot distinguish which column is the active sort column. |
| No live region | **4.1.3 Status Messages** | Sort changes are silent to screen readers — users get no confirmation that their action had any effect. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'scrollable-region-focusable', enabled: false },
        ],
      },
    },
  },
};
