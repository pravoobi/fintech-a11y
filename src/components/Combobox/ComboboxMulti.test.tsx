import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, it, expect, vi } from 'vitest';
import { ComboboxMulti } from './ComboboxMulti';

const OPTIONS = [
  { value: 'usd', label: 'US Dollar' },
  { value: 'eur', label: 'Euro' },
  { value: 'gbp', label: 'British Pound' },
  { value: 'jpy', label: 'Japanese Yen' },
];

// ─── axe ─────────────────────────────────────────────────────────────────────

describe('ComboboxMulti — axe', () => {
  it('passes with no selections', async () => {
    const { container } = render(
      <ComboboxMulti label="Currencies" options={OPTIONS} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes with selections and open listbox', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ComboboxMulti label="Currencies" options={OPTIONS} value={['usd', 'eur']} onChange={() => {}} />,
    );
    const input = screen.getByRole('combobox', { name: 'Currencies' });
    await user.click(input);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes with error state', async () => {
    const { container } = render(
      <ComboboxMulti
        label="Currencies"
        options={OPTIONS}
        value={[]}
        errorMessage="Please select at least one currency"
        required
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Roles and accessible names (4.1.2) ──────────────────────────────────────

describe('ComboboxMulti — roles and naming', () => {
  it('renders a combobox with the supplied label', () => {
    render(<ComboboxMulti label="Currencies" options={OPTIONS} />);
    expect(screen.getByRole('combobox', { name: 'Currencies' })).toBeInTheDocument();
  });

  it('renders a listbox with aria-multiselectable="true"', () => {
    render(<ComboboxMulti label="Currencies" options={OPTIONS} />);
    const listbox = screen.getByRole('listbox', { hidden: true });
    expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
  });

  it('marks selected options with aria-selected="true"', async () => {
    const user = userEvent.setup();
    render(
      <ComboboxMulti label="Currencies" options={OPTIONS} value={['usd', 'gbp']} onChange={() => {}} />,
    );
    await user.click(screen.getByRole('combobox'));
    const opts = screen.getAllByRole('option');
    const usd = opts.find((o) => o.textContent?.includes('US Dollar'));
    const gbp = opts.find((o) => o.textContent?.includes('British Pound'));
    const eur = opts.find((o) => o.textContent?.includes('Euro'));
    expect(usd).toHaveAttribute('aria-selected', 'true');
    expect(gbp).toHaveAttribute('aria-selected', 'true');
    expect(eur).toHaveAttribute('aria-selected', 'false');
  });

  it('renders remove buttons with accessible names', () => {
    render(
      <ComboboxMulti label="Currencies" options={OPTIONS} value={['usd', 'eur']} onChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Remove US Dollar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Euro' })).toBeInTheDocument();
  });

  it('aria-required is set when required prop is true', () => {
    render(<ComboboxMulti label="Currencies" options={OPTIONS} required />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-required', 'true');
  });

  it('aria-invalid is set when errorMessage is provided', () => {
    render(
      <ComboboxMulti label="Currencies" options={OPTIONS} errorMessage="Required" />,
    );
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('links hint and error via aria-describedby', () => {
    render(
      <ComboboxMulti
        label="Currencies"
        options={OPTIONS}
        hint="Choose one or more"
        errorMessage="Required"
      />,
    );
    const input = screen.getByRole('combobox');
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    const ids = describedBy.split(' ');
    expect(ids).toHaveLength(2);
    ids.forEach((id) => expect(document.getElementById(id)).not.toBeNull());
  });
});

// ─── Open / close (2.1.1) ─────────────────────────────────────────────────────

describe('ComboboxMulti — open / close', () => {
  it('opens listbox on focus', async () => {
    const user = userEvent.setup();
    render(<ComboboxMulti label="Currencies" options={OPTIONS} />);
    await user.tab();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens on ArrowDown when closed', async () => {
    const user = userEvent.setup();
    render(<ComboboxMulti label="Currencies" options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    input.focus();
    // First focus opens it; close with Escape then reopen
    await user.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on Escape and clears query', async () => {
    const user = userEvent.setup();
    render(<ComboboxMulti label="Currencies" options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'dol');
    await user.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveValue('');
  });
});

// ─── Selection via keyboard (2.1.1) ──────────────────────────────────────────

describe('ComboboxMulti — keyboard selection', () => {
  it('toggles option with Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ComboboxMulti label="Currencies" options={OPTIONS} value={[]} onChange={onChange} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowDown}'); // highlight first option
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith(['usd']);
  });

  it('deselects already-selected option with Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ComboboxMulti label="Currencies" options={OPTIONS} value={['usd']} onChange={onChange} />,
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowDown}'); // highlight first option (usd)
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('removes last tag with Backspace on empty input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ComboboxMulti label="Currencies" options={OPTIONS} value={['usd', 'eur']} onChange={onChange} />,
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{Backspace}');
    expect(onChange).toHaveBeenCalledWith(['usd']);
  });

  it('does not remove tag on Backspace when query has text', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ComboboxMulti label="Currencies" options={OPTIONS} value={['usd']} onChange={onChange} />,
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'eu');
    await user.keyboard('{Backspace}'); // removes 'u' from query, not a tag
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ─── Selection via click ──────────────────────────────────────────────────────

describe('ComboboxMulti — click selection', () => {
  it('calls onChange when an option is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ComboboxMulti label="Currencies" options={OPTIONS} value={[]} onChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: /Euro/ }));
    expect(onChange).toHaveBeenCalledWith(['eur']);
  });

  it('removes tag when Remove button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ComboboxMulti label="Currencies" options={OPTIONS} value={['usd', 'eur']} onChange={onChange} />,
    );
    await user.click(screen.getByRole('button', { name: 'Remove Euro' }));
    expect(onChange).toHaveBeenCalledWith(['usd']);
  });
});

// ─── Filtering ────────────────────────────────────────────────────────────────

describe('ComboboxMulti — filtering', () => {
  it('filters options by query text', async () => {
    const user = userEvent.setup();
    render(<ComboboxMulti label="Currencies" options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'dollar');
    const opts = screen.getAllByRole('option');
    expect(opts).toHaveLength(1);
    expect(opts[0]).toHaveTextContent('US Dollar');
  });

  it('shows "No results found" when nothing matches', async () => {
    const user = userEvent.setup();
    render(<ComboboxMulti label="Currencies" options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'zzz');
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });
});

// ─── Live region announcements (4.1.3) ───────────────────────────────────────

describe('ComboboxMulti — live region', () => {
  it('renders a polite live region', () => {
    render(<ComboboxMulti label="Currencies" options={OPTIONS} />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
  });
});
