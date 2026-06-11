import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Combobox } from './Combobox';
import type { ComboboxOption } from './Combobox';

const PAYEES: ComboboxOption[] = [
  { value: 'alice', label: 'Alice Johnson' },
  { value: 'bob', label: 'Bob Smith' },
  { value: 'carol', label: 'Carol White' },
  { value: 'david', label: 'David Lee' },
];

function renderCombobox(props: Partial<React.ComponentProps<typeof Combobox>> = {}) {
  return render(<Combobox label="Payee" options={PAYEES} {...props} />);
}

function getInput() {
  return screen.getByRole('combobox');
}

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('Combobox — axe', () => {
  it('has no violations in default (closed) state', async () => {
    const { container } = renderCombobox();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when open', async () => {
    const user = userEvent.setup();
    const { container } = renderCombobox();
    await user.click(getInput());
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a selected value', async () => {
    const { container } = renderCombobox({ value: 'alice', onChange: vi.fn() });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = renderCombobox({ errorMessage: 'Please select a payee.' });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with hint text', async () => {
    const { container } = renderCombobox({ hint: 'Search by name.' });
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Label association (3.3.2, 1.3.1) ────────────────────────────────────────

describe('Combobox — label association (3.3.2, 1.3.1)', () => {
  it('associates the label with the input via htmlFor/id', () => {
    renderCombobox();
    expect(screen.getByRole('combobox', { name: /payee/i })).toBeInTheDocument();
  });

  it('renders a visible <label> element', () => {
    renderCombobox();
    expect(screen.getByText('Payee', { selector: 'label' })).toBeInTheDocument();
  });
});

// ─── ARIA attributes (4.1.2) ──────────────────────────────────────────────────

describe('Combobox — ARIA attributes (4.1.2)', () => {
  it('has role="combobox" on the input', () => {
    renderCombobox();
    expect(getInput()).toHaveAttribute('role', 'combobox');
  });

  it('has aria-expanded="false" when closed', () => {
    renderCombobox();
    expect(getInput()).toHaveAttribute('aria-expanded', 'false');
  });

  it('has aria-expanded="true" after focusing', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(getInput());
    expect(getInput()).toHaveAttribute('aria-expanded', 'true');
  });

  it('has aria-autocomplete="list"', () => {
    renderCombobox();
    expect(getInput()).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('has aria-controls pointing to the listbox', () => {
    renderCombobox();
    const input = getInput();
    const listbox = screen.getByRole('listbox');
    expect(input.getAttribute('aria-controls')).toBe(listbox.id);
  });

  it('does not set aria-activedescendant when no option is highlighted', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(getInput());
    expect(getInput()).not.toHaveAttribute('aria-activedescendant');
  });

  it('sets aria-activedescendant to the first option after ArrowDown', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(getInput());
    fireEvent.keyDown(getInput(), { key: 'ArrowDown' });

    const input = getInput();
    const activedescendant = input.getAttribute('aria-activedescendant');
    expect(activedescendant).toBeTruthy();

    // The element it points to should be the first option in the listbox
    const pointedEl = document.getElementById(activedescendant!);
    expect(pointedEl).toBeInTheDocument();
    expect(pointedEl?.textContent).toMatch(/alice johnson/i);
  });

  it('updates aria-activedescendant as focus moves down the list', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(getInput());

    fireEvent.keyDown(getInput(), { key: 'ArrowDown' });
    fireEvent.keyDown(getInput(), { key: 'ArrowDown' });

    const activedescendant = getInput().getAttribute('aria-activedescendant');
    const pointedEl = document.getElementById(activedescendant!);
    expect(pointedEl?.textContent).toMatch(/bob smith/i);
  });

  it('clears aria-activedescendant after Escape', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(getInput());
    fireEvent.keyDown(getInput(), { key: 'ArrowDown' });
    fireEvent.keyDown(getInput(), { key: 'Escape' });
    expect(getInput()).not.toHaveAttribute('aria-activedescendant');
  });
});

// ─── Listbox and options (1.3.1, 4.1.2) ──────────────────────────────────────

describe('Combobox — listbox (1.3.1, 4.1.2)', () => {
  it('renders a listbox with an accessible name', () => {
    renderCombobox();
    expect(screen.getByRole('listbox', { name: /payee/i })).toBeInTheDocument();
  });

  it('renders all options as role="option"', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(getInput());
    expect(screen.getAllByRole('option')).toHaveLength(PAYEES.length);
  });

  it('sets aria-selected="true" on the selected option', async () => {
    const user = userEvent.setup();
    renderCombobox({ value: 'bob', onChange: vi.fn() });
    await user.click(getInput());
    const options = screen.getAllByRole('option');
    const bob = options.find((o) => o.textContent?.includes('Bob Smith'));
    expect(bob).toHaveAttribute('aria-selected', 'true');
  });

  it('sets aria-selected="false" on non-selected options', async () => {
    const user = userEvent.setup();
    renderCombobox({ value: 'bob', onChange: vi.fn() });
    await user.click(getInput());
    // Pre-filled query is "Bob Smith" — clear it so all options are visible
    fireEvent.change(getInput(), { target: { value: '' } });
    const options = screen.getAllByRole('option');
    const alice = options.find((o) => o.textContent?.includes('Alice Johnson'));
    expect(alice).toHaveAttribute('aria-selected', 'false');
  });
});

// ─── Keyboard interaction (2.1.1) ─────────────────────────────────────────────

describe('Combobox — keyboard interaction (2.1.1)', () => {
  it('opens the listbox on ArrowDown when closed', () => {
    renderCombobox();
    fireEvent.focus(getInput());
    // Close it first
    fireEvent.keyDown(getInput(), { key: 'Escape' });
    expect(getInput()).toHaveAttribute('aria-expanded', 'false');
    fireEvent.keyDown(getInput(), { key: 'ArrowDown' });
    expect(getInput()).toHaveAttribute('aria-expanded', 'true');
  });

  it('selects the highlighted option on Enter', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCombobox({ onChange });
    await user.click(getInput());
    fireEvent.keyDown(getInput(), { key: 'ArrowDown' });
    fireEvent.keyDown(getInput(), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('alice');
    expect(getInput()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the listbox on Escape without selecting', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCombobox({ onChange });
    await user.click(getInput());
    fireEvent.keyDown(getInput(), { key: 'ArrowDown' });
    fireEvent.keyDown(getInput(), { key: 'Escape' });
    expect(getInput()).toHaveAttribute('aria-expanded', 'false');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ArrowUp from the first option returns highlight to the input (no activedescendant)', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(getInput());
    fireEvent.keyDown(getInput(), { key: 'ArrowDown' }); // highlight index 0
    fireEvent.keyDown(getInput(), { key: 'ArrowUp' });   // back to -1
    expect(getInput()).not.toHaveAttribute('aria-activedescendant');
  });

  it('can be reached by Tab', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.tab();
    expect(getInput()).toHaveFocus();
  });
});

// ─── Filtering (1.3.1) ────────────────────────────────────────────────────────

describe('Combobox — filtering', () => {
  it('filters options as the user types', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(getInput());
    await user.type(getInput(), 'alice');
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0].textContent).toMatch(/alice johnson/i);
  });

  it('shows all options when the query is cleared', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(getInput());
    await user.type(getInput(), 'ali');
    await user.clear(getInput());
    expect(screen.getAllByRole('option')).toHaveLength(PAYEES.length);
  });

  it('shows "No results found" when nothing matches', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(getInput());
    await user.type(getInput(), 'zzz');
    // "No results found" appears in both the listbox option and the live region —
    // target the listbox option specifically
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getByText(/no results found/i)).toBeInTheDocument();
  });
});

// ─── Live region (4.1.3) ──────────────────────────────────────────────────────

describe('Combobox — live region (4.1.3)', () => {
  it('has a polite live region', () => {
    renderCombobox();
    expect(document.querySelector('[role="status"][aria-live="polite"]')).toBeInTheDocument();
  });

  it('announces the result count when the listbox opens', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(getInput());
    await waitFor(() => {
      const region = document.querySelector('[role="status"][aria-live="polite"]');
      expect(region?.textContent).toMatch(/4 results available/i);
    });
  });

  it('announces the filtered count when typing', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(getInput());
    await user.type(getInput(), 'alice');
    await waitFor(() => {
      const region = document.querySelector('[role="status"][aria-live="polite"]');
      expect(region?.textContent).toMatch(/1 result available/i);
    });
  });

  it('announces "No results found" when nothing matches', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(getInput());
    await user.type(getInput(), 'zzz');
    await waitFor(() => {
      const region = document.querySelector('[role="status"][aria-live="polite"]');
      expect(region?.textContent).toMatch(/no results found/i);
    });
  });
});

// ─── onChange callback ────────────────────────────────────────────────────────

describe('Combobox — onChange', () => {
  it('calls onChange with the option value when an option is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCombobox({ onChange });
    await user.click(getInput());
    await user.click(screen.getByRole('option', { name: /carol white/i }));
    expect(onChange).toHaveBeenCalledWith('carol');
  });

  it('calls onChange with undefined when the clear button is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    renderCombobox({ value: 'alice', onChange });
    await user.click(screen.getByRole('button', { name: /clear selection/i }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('displays the selected option label after selection', async () => {
    const user = userEvent.setup();
    renderCombobox();
    await user.click(getInput());
    await user.click(screen.getByRole('option', { name: /david lee/i }));
    expect(getInput()).toHaveValue('David Lee');
  });
});

// ─── Error state (3.3.1, 4.1.2) ──────────────────────────────────────────────

describe('Combobox — error state (3.3.1, 4.1.2)', () => {
  it('sets aria-invalid on the input when errorMessage is provided', () => {
    renderCombobox({ errorMessage: 'Please select a payee.' });
    expect(getInput()).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when there is no error', () => {
    renderCombobox();
    expect(getInput()).not.toHaveAttribute('aria-invalid');
  });

  it('links the error to the input via aria-describedby', () => {
    renderCombobox({ errorMessage: 'Please select a payee.' });
    const input = getInput();
    const errorEl = screen.getAllByText('Please select a payee.').find(
      (el) => el.tagName === 'P'
    )!;
    expect(input.getAttribute('aria-describedby')).toContain(errorEl.id);
  });

  it('renders the error with an icon (1.4.1)', () => {
    renderCombobox({ errorMessage: 'Please select a payee.' });
    const errorEl = screen.getAllByText('Please select a payee.').find(
      (el) => el.tagName === 'P'
    )!;
    expect(errorEl.textContent).toContain('⚠');
  });
});

// ─── Hint text ────────────────────────────────────────────────────────────────

describe('Combobox — hint text', () => {
  it('renders hint text when provided', () => {
    renderCombobox({ hint: 'Search by name.' });
    expect(screen.getByText('Search by name.')).toBeInTheDocument();
  });

  it('links the hint to the input via aria-describedby', () => {
    renderCombobox({ hint: 'Search by name.' });
    const hint = screen.getByText('Search by name.');
    expect(getInput().getAttribute('aria-describedby')).toContain(hint.id);
  });
});

// ─── Disabled state ───────────────────────────────────────────────────────────

describe('Combobox — disabled state', () => {
  it('disables the input when disabled prop is set', () => {
    renderCombobox({ disabled: true });
    expect(getInput()).toBeDisabled();
  });
});

// ─── Required ─────────────────────────────────────────────────────────────────

describe('Combobox — required', () => {
  it('marks the input as required', () => {
    renderCombobox({ required: true });
    expect(getInput()).toHaveAttribute('aria-required', 'true');
  });
});
