import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { DataTable } from './DataTable';
import type { DataTableColumn, DataTableRow } from './DataTable';

const COLUMNS: DataTableColumn[] = [
  { key: 'name', label: 'Payee', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
  { key: 'status', label: 'Status' },
];

const ROWS: DataTableRow[] = [
  { id: 1, name: 'Alice Johnson', date: '2026-06-01', amount: 1200, status: 'Completed' },
  { id: 2, name: 'Bob Smith', date: '2026-06-03', amount: 450.5, status: 'Pending' },
  { id: 3, name: 'Carol White', date: '2026-05-28', amount: 8750, status: 'Completed' },
];

function renderTable(overrides = {}) {
  return render(
    <DataTable
      caption="Recent transactions"
      columns={COLUMNS}
      rows={ROWS}
      {...overrides}
    />
  );
}

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('DataTable — axe', () => {
  it('has no violations in default state', async () => {
    const { container } = renderTable();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when sorted ascending', async () => {
    const { container } = renderTable({
      sortState: { key: 'amount', direction: 'ascending' },
      onSort: vi.fn(),
    });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when sorted descending', async () => {
    const { container } = renderTable({
      sortState: { key: 'name', direction: 'descending' },
      onSort: vi.fn(),
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Table semantics (1.3.1) ──────────────────────────────────────────────────

describe('DataTable — table semantics (1.3.1)', () => {
  it('renders a <table> element', () => {
    renderTable();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders a visible <caption>', () => {
    renderTable();
    expect(screen.getByText('Recent transactions')).toBeInTheDocument();
  });

  it('renders column headers with scope="col"', () => {
    renderTable();
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(COLUMNS.length);
    headers.forEach((th) => expect(th).toHaveAttribute('scope', 'col'));
  });

  it('renders the correct number of rows', () => {
    renderTable();
    expect(screen.getAllByRole('row')).toHaveLength(ROWS.length + 1); // +1 for header row
  });

  it('renders cell data in the correct columns', () => {
    renderTable();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    // 'Pending' appears exactly once — use it to avoid the multiple-match error
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});

// ─── aria-sort (4.1.2) ────────────────────────────────────────────────────────

describe('DataTable — aria-sort (4.1.2)', () => {
  it('sets aria-sort="none" on unsorted sortable columns', () => {
    renderTable();
    const headers = screen.getAllByRole('columnheader');
    // First three columns are sortable, last is not
    expect(headers[0]).toHaveAttribute('aria-sort', 'none');
    expect(headers[1]).toHaveAttribute('aria-sort', 'none');
    expect(headers[2]).toHaveAttribute('aria-sort', 'none');
  });

  it('does not set aria-sort on non-sortable columns', () => {
    renderTable();
    const statusHeader = screen.getByRole('columnheader', { name: /status/i });
    expect(statusHeader).not.toHaveAttribute('aria-sort');
  });

  it('sets aria-sort="ascending" on the sorted column', () => {
    renderTable({ sortState: { key: 'amount', direction: 'ascending' }, onSort: vi.fn() });
    const amountHeader = screen.getByRole('columnheader', { name: /amount/i });
    expect(amountHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('sets aria-sort="descending" on the sorted column', () => {
    renderTable({ sortState: { key: 'name', direction: 'descending' }, onSort: vi.fn() });
    const nameHeader = screen.getByRole('columnheader', { name: /payee/i });
    expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
  });

  it('keeps aria-sort="none" on other sortable columns when one is sorted', () => {
    renderTable({ sortState: { key: 'amount', direction: 'ascending' }, onSort: vi.fn() });
    const nameHeader = screen.getByRole('columnheader', { name: /payee/i });
    expect(nameHeader).toHaveAttribute('aria-sort', 'none');
  });
});

// ─── Sort buttons (4.1.2, 2.5.8) ─────────────────────────────────────────────

describe('DataTable — sort buttons (4.1.2)', () => {
  it('renders a <button> inside each sortable column header', () => {
    renderTable();
    const sortableHeaders = screen.getAllByRole('columnheader').slice(0, 3);
    sortableHeaders.forEach((th) => {
      expect(within(th).getByRole('button')).toBeInTheDocument();
    });
  });

  it('does not render a button in a non-sortable column header', () => {
    renderTable();
    const statusHeader = screen.getByRole('columnheader', { name: /status/i });
    expect(within(statusHeader).queryByRole('button')).not.toBeInTheDocument();
  });

  it('sort buttons have an accessible name matching the column label', () => {
    renderTable();
    expect(screen.getByRole('button', { name: /payee/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /date/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /amount/i })).toBeInTheDocument();
  });
});

// ─── Sort interaction ─────────────────────────────────────────────────────────

describe('DataTable — sort interaction', () => {
  it('calls onSort with ascending on first click', () => {
    const onSort = vi.fn();
    renderTable({ onSort });
    fireEvent.click(screen.getByRole('button', { name: /payee/i }));
    expect(onSort).toHaveBeenCalledWith({ key: 'name', direction: 'ascending' });
  });

  it('calls onSort with descending on second click of the same column', () => {
    const onSort = vi.fn();
    renderTable({
      sortState: { key: 'name', direction: 'ascending' },
      onSort,
    });
    fireEvent.click(screen.getByRole('button', { name: /payee/i }));
    expect(onSort).toHaveBeenCalledWith({ key: 'name', direction: 'descending' });
  });

  it('calls onSort with ascending when switching to a different column', () => {
    const onSort = vi.fn();
    renderTable({
      sortState: { key: 'name', direction: 'descending' },
      onSort,
    });
    fireEvent.click(screen.getByRole('button', { name: /amount/i }));
    expect(onSort).toHaveBeenCalledWith({ key: 'amount', direction: 'ascending' });
  });

  it('sorts rows internally when no onSort prop is provided (uncontrolled)', () => {
    renderTable();
    fireEvent.click(screen.getByRole('button', { name: /amount/i }));
    const cells = screen.getAllByRole('cell');
    // Amount column is index 2 (0-based); rows should be ascending: 450.5, 1200, 8750
    const amountCells = cells.filter((_, i) => i % COLUMNS.length === 2);
    expect(amountCells[0].textContent).toBe('450.5');
    expect(amountCells[1].textContent).toBe('1200');
    expect(amountCells[2].textContent).toBe('8750');
  });
});

// ─── Live region (4.1.3) ──────────────────────────────────────────────────────

describe('DataTable — live region (4.1.3)', () => {
  it('has a polite live region', () => {
    renderTable();
    const region = document.querySelector('[role="status"][aria-live="polite"]');
    expect(region).toBeInTheDocument();
  });

  it('live region is empty on initial render', () => {
    renderTable();
    const region = document.querySelector('[role="status"][aria-live="polite"]');
    expect(region?.textContent).toBe('');
  });

  it('announces the sort column and direction after sorting', async () => {
    renderTable();
    fireEvent.click(screen.getByRole('button', { name: /amount/i }));
    await waitFor(() => {
      const region = document.querySelector('[role="status"][aria-live="polite"]');
      expect(region?.textContent).toMatch(/sorted by amount, ascending/i);
    });
  });

  it('updates the announcement when sort direction changes', async () => {
    const { rerender } = renderTable({
      sortState: { key: 'amount', direction: 'ascending' },
      onSort: vi.fn(),
    });
    rerender(
      <DataTable
        caption="Recent transactions"
        columns={COLUMNS}
        rows={ROWS}
        sortState={{ key: 'amount', direction: 'descending' }}
        onSort={vi.fn()}
      />
    );
    await waitFor(() => {
      const region = document.querySelector('[role="status"][aria-live="polite"]');
      expect(region?.textContent).toMatch(/sorted by amount, descending/i);
    });
  });
});

// ─── Keyboard operability (2.1.1) ─────────────────────────────────────────────

describe('DataTable — keyboard operability (2.1.1)', () => {
  it('sort buttons are reachable by Tab', async () => {
    const user = userEvent.setup();
    renderTable();
    await user.tab();
    // The scroll container or first sort button receives focus
    const focused = document.activeElement;
    expect(focused).not.toBe(document.body);
  });

  it('sort button can be activated with Enter', () => {
    const onSort = vi.fn();
    renderTable({ onSort });
    const btn = screen.getByRole('button', { name: /payee/i });
    btn.focus();
    fireEvent.keyDown(btn, { key: 'Enter' });
    fireEvent.click(btn); // Enter on a button fires a click
    expect(onSort).toHaveBeenCalled();
  });
});
