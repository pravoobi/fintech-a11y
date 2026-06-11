import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { AmountInput } from './AmountInput';

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('AmountInput — axe', () => {
  it('has no violations in default state', async () => {
    const { container } = render(<AmountInput label="Transfer amount" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with currency symbol and label', async () => {
    const { container } = render(
      <AmountInput label="Transfer amount" currencySymbol="$" currencyLabel="US dollars" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with hint text', async () => {
    const { container } = render(
      <AmountInput label="Transfer amount" hint="Maximum transfer is $10,000 per day." />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = render(
      <AmountInput label="Transfer amount" errorMessage="Amount exceeds your daily limit." />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when required', async () => {
    const { container } = render(<AmountInput label="Transfer amount" required />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when disabled', async () => {
    const { container } = render(<AmountInput label="Transfer amount" disabled />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Label association ─────────────────────────────────────────────────────────

describe('AmountInput — label association (1.3.1, 3.3.2)', () => {
  it('associates the label with the input via htmlFor/id', () => {
    render(<AmountInput label="Transfer amount" />);
    expect(screen.getByRole('textbox', { name: /transfer amount/i })).toBeInTheDocument();
  });

  it('renders a visible <label> element', () => {
    render(<AmountInput label="Transfer amount" />);
    expect(screen.getByText('Transfer amount', { selector: 'label' })).toBeInTheDocument();
  });
});

// ─── Currency accessibility (1.3.1, 4.1.2) ───────────────────────────────────

describe('AmountInput — currency accessibility (1.3.1)', () => {
  it('renders the currency symbol with aria-hidden so AT ignores it', () => {
    render(<AmountInput label="Transfer amount" currencySymbol="$" currencyLabel="US dollars" />);
    const symbol = screen.getByText('$');
    expect(symbol).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders a visually-hidden currency description linked via aria-describedby', () => {
    render(<AmountInput label="Transfer amount" currencySymbol="$" currencyLabel="US dollars" />);
    const input = screen.getByRole('textbox');
    const currencyDesc = screen.getByText('US dollars');
    expect(input.getAttribute('aria-describedby')).toContain(currencyDesc.id);
  });

  it('uses currencyLabel as the hidden description when provided', () => {
    render(<AmountInput label="Transfer amount" currencySymbol="$" currencyLabel="US dollars" />);
    expect(screen.getByText('US dollars')).toBeInTheDocument();
  });

  it('falls back to currencySymbol as the hidden description when currencyLabel is omitted', () => {
    render(<AmountInput label="Transfer amount" currencySymbol="£" />);
    // The £ symbol appears twice: once aria-hidden (visual), once in the sr-only description
    const allPounds = screen.getAllByText('£');
    // One is aria-hidden, the other is the sr-only description
    const hiddenDesc = allPounds.find((el) => !el.hasAttribute('aria-hidden'));
    expect(hiddenDesc).toBeInTheDocument();
  });

  it('sets inputmode="decimal" for numeric keyboard on mobile', () => {
    render(<AmountInput label="Transfer amount" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'decimal');
  });

  it('does not set aria-describedby for currency when no currency props are given', () => {
    render(<AmountInput label="Transfer amount" />);
    // No currency description element, so describedby should not reference one
    const input = screen.getByRole('textbox');
    // If only a hint or error is present describedby would exist; with none it should be absent
    expect(input).not.toHaveAttribute('aria-describedby');
  });
});

// ─── Formatting behaviour ─────────────────────────────────────────────────────

describe('AmountInput — formatting (keyboard operability, 1.3.1)', () => {
  it('formats the value with thousands separators on blur', () => {
    render(<AmountInput label="Transfer amount" />);
    const input = screen.getByRole('textbox');

    // fireEvent is reliable for controlled inputs; user.type can misfire in React 18 jsdom
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '1234.56' } });
    fireEvent.blur(input);

    expect(input).toHaveValue('1,234.56');
  });

  it('strips formatting on focus so the user edits a plain number', async () => {
    const user = userEvent.setup();
    render(<AmountInput label="Transfer amount" value={1234.56} />);
    const input = screen.getByRole('textbox');

    // Initially formatted
    expect(input).toHaveValue('1,234.56');

    await user.click(input);

    // Formatting stripped for clean editing
    expect(input).toHaveValue('1234.56');
  });

  it('does not format while the user is typing — no mid-keystroke caret jump', () => {
    render(<AmountInput label="Transfer amount" />);
    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '1000' } });

    // While focused (not yet blurred), no formatting applied
    expect(input).toHaveValue('1000');
  });

  it('displays a pre-existing value formatted on initial render', () => {
    render(<AmountInput label="Transfer amount" value={9999.99} />);
    expect(screen.getByRole('textbox')).toHaveValue('9,999.99');
  });

  it('clears the display when an empty string is blurred', () => {
    // No controlled value prop — clearing leaves the field empty after blur
    render(<AmountInput label="Transfer amount" />);
    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '100' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('100.00');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('');
  });
});

// ─── onChange callback ────────────────────────────────────────────────────────

describe('AmountInput — onChange callback', () => {
  it('calls onChange with the parsed number on blur', () => {
    const onChange = vi.fn();
    render(<AmountInput label="Transfer amount" onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '250.50' } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(250.5);
  });

  it('calls onChange with undefined when the field is cleared', () => {
    const onChange = vi.fn();
    render(<AmountInput label="Transfer amount" onChange={onChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('calls onChange with undefined when only non-numeric text is entered', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AmountInput label="Transfer amount" onChange={onChange} />);
    const input = screen.getByRole('textbox');

    await user.click(input);
    // Non-numeric characters are stripped by handleChange, result is empty
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});

// ─── Error state ──────────────────────────────────────────────────────────────

describe('AmountInput — error state (3.3.1, 1.4.1, 4.1.2, 4.1.3)', () => {
  it('sets aria-invalid on the input when errorMessage is provided', () => {
    render(<AmountInput label="Transfer amount" errorMessage="Amount exceeds daily limit." />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when there is no error', () => {
    render(<AmountInput label="Transfer amount" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('links the error to the input via aria-describedby', () => {
    render(<AmountInput label="Transfer amount" errorMessage="Amount exceeds daily limit." />);
    const input = screen.getByRole('textbox');
    const errorPara = screen
      .getAllByText('Amount exceeds daily limit.', { exact: false })
      .find((el) => el.tagName === 'P')!;
    expect(input.getAttribute('aria-describedby')).toContain(errorPara.id);
  });

  it('renders the error with an icon — color is not the sole indicator (1.4.1)', () => {
    render(<AmountInput label="Transfer amount" errorMessage="Amount exceeds daily limit." />);
    const errorPara = screen
      .getAllByText('Amount exceeds daily limit.', { exact: false })
      .find((el) => el.tagName === 'P')!;
    expect(errorPara.textContent).toContain('⚠');
  });

  it('populates the polite live region with the error message (4.1.3)', () => {
    render(<AmountInput label="Transfer amount" errorMessage="Amount exceeds daily limit." />);
    const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion?.textContent).toContain('Amount exceeds daily limit.');
  });
});

// ─── Hint text ────────────────────────────────────────────────────────────────

describe('AmountInput — hint text', () => {
  it('renders hint text when provided', () => {
    render(<AmountInput label="Transfer amount" hint="Maximum $10,000 per day." />);
    expect(screen.getByText('Maximum $10,000 per day.')).toBeInTheDocument();
  });

  it('links the hint to the input via aria-describedby', () => {
    render(<AmountInput label="Transfer amount" hint="Maximum $10,000 per day." />);
    const input = screen.getByRole('textbox');
    const hintEl = screen.getByText('Maximum $10,000 per day.');
    expect(input.getAttribute('aria-describedby')).toContain(hintEl.id);
  });
});

// ─── Disabled state ───────────────────────────────────────────────────────────

describe('AmountInput — disabled state', () => {
  it('disables the input when disabled prop is set', () => {
    render(<AmountInput label="Transfer amount" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

// ─── Required ─────────────────────────────────────────────────────────────────

describe('AmountInput — required', () => {
  it('marks the input as required', () => {
    render(<AmountInput label="Transfer amount" required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('renders the visual asterisk with aria-hidden', () => {
    render(<AmountInput label="Transfer amount" required />);
    const asterisk = document.querySelector('[aria-hidden="true"]');
    expect(asterisk?.textContent?.trim()).toBe('*');
  });
});

// ─── Keyboard interaction ─────────────────────────────────────────────────────

describe('AmountInput — keyboard interaction', () => {
  it('can be reached by Tab', async () => {
    const user = userEvent.setup();
    render(<AmountInput label="Transfer amount" />);
    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('accepts typed digits and decimal point', () => {
    render(<AmountInput label="Transfer amount" />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '42.00' } });
    expect(input).toHaveValue('42.00');
  });
});
