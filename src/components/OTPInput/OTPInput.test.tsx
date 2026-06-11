import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { OTPInput } from './OTPInput';

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('OTPInput — axe', () => {
  it('has no violations in default state', async () => {
    const { container } = render(<OTPInput />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = render(<OTPInput errorMessage="Invalid code. Please try again." />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in disabled state', async () => {
    const { container } = render(<OTPInput disabled />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Accessible name / role / structure ───────────────────────────────────────

describe('OTPInput — accessible structure', () => {
  it('renders a fieldset with the legend as label', () => {
    render(<OTPInput label="Verification code" />);
    // fieldset is surfaced as "group" role
    const group = screen.getByRole('group', { name: 'Verification code' });
    expect(group.tagName).toBe('FIELDSET');
  });

  it('labels each input with its position (e.g. "Digit 1 of 6")', () => {
    render(<OTPInput length={6} />);
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByRole('textbox', { name: `Digit ${i} of 6` })).toBeInTheDocument();
    }
  });

  it('renders the correct number of inputs', () => {
    render(<OTPInput length={4} />);
    expect(screen.getAllByRole('textbox')).toHaveLength(4);
  });

  it('first input carries autocomplete="one-time-code"', () => {
    render(<OTPInput />);
    expect(screen.getByRole('textbox', { name: 'Digit 1 of 6' })).toHaveAttribute(
      'autocomplete',
      'one-time-code'
    );
  });

  it('subsequent inputs carry autocomplete="off"', () => {
    render(<OTPInput />);
    for (let i = 2; i <= 6; i++) {
      expect(screen.getByRole('textbox', { name: `Digit ${i} of 6` })).toHaveAttribute(
        'autocomplete',
        'off'
      );
    }
  });

  it('sets inputmode="numeric" on every field', () => {
    render(<OTPInput />);
    screen.getAllByRole('textbox').forEach((input) => {
      expect(input).toHaveAttribute('inputmode', 'numeric');
    });
  });
});

// ─── Error state ──────────────────────────────────────────────────────────────

describe('OTPInput — error state', () => {
  it('marks all inputs aria-invalid when errorMessage is set', () => {
    render(<OTPInput errorMessage="Invalid code." />);
    screen.getAllByRole('textbox').forEach((input) => {
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('links all inputs to the error message via aria-describedby', () => {
    render(<OTPInput errorMessage="Invalid code." />);
    const errorEl = screen.getByRole('alert');
    const errorId = errorEl.id;
    screen.getAllByRole('textbox').forEach((input) => {
      expect(input).toHaveAttribute('aria-describedby', errorId);
    });
  });

  it('surfaces the error message in a role="alert" element', () => {
    render(<OTPInput errorMessage="Invalid code. Please try again." />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid code. Please try again.');
  });

  it('does not set aria-invalid when there is no error', () => {
    render(<OTPInput />);
    screen.getAllByRole('textbox').forEach((input) => {
      expect(input).not.toHaveAttribute('aria-invalid');
    });
  });
});

// ─── Keyboard interaction ─────────────────────────────────────────────────────

describe('OTPInput — keyboard interaction', () => {
  it('advances focus to the next field after a digit is typed', async () => {
    const user = userEvent.setup();
    render(<OTPInput />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[0]);
    await user.keyboard('3');

    expect(inputs[1]).toHaveFocus();
  });

  it('moves focus to the previous field on Backspace when current field is empty', async () => {
    const user = userEvent.setup();
    render(<OTPInput />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[0]);
    await user.keyboard('3');
    // focus is now on inputs[1]
    await user.keyboard('{Backspace}');

    expect(inputs[0]).toHaveFocus();
  });

  it('clears the current field on Backspace when it has a value', async () => {
    const user = userEvent.setup();
    render(<OTPInput />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[0]);
    await user.keyboard('5');
    await user.click(inputs[0]);
    await user.keyboard('{Backspace}');

    expect(inputs[0]).toHaveValue('');
  });

  it('moves focus left with ArrowLeft', async () => {
    const user = userEvent.setup();
    render(<OTPInput />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[2]);
    await user.keyboard('{ArrowLeft}');

    expect(inputs[1]).toHaveFocus();
  });

  it('moves focus right with ArrowRight', async () => {
    const user = userEvent.setup();
    render(<OTPInput />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[1]);
    await user.keyboard('{ArrowRight}');

    expect(inputs[2]).toHaveFocus();
  });

  it('does not move focus past the first field with ArrowLeft', async () => {
    const user = userEvent.setup();
    render(<OTPInput />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[0]);
    await user.keyboard('{ArrowLeft}');

    expect(inputs[0]).toHaveFocus();
  });

  it('does not move focus past the last field with ArrowRight', async () => {
    const user = userEvent.setup();
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[3]);
    await user.keyboard('{ArrowRight}');

    expect(inputs[3]).toHaveFocus();
  });

  it('ignores non-numeric key presses', async () => {
    const user = userEvent.setup();
    render(<OTPInput />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[0]);
    await user.keyboard('a');

    expect(inputs[0]).toHaveValue('');
  });
});

// ─── Paste ────────────────────────────────────────────────────────────────────

describe('OTPInput — paste (3.3.8 Accessible Authentication)', () => {
  it('distributes a pasted code across all fields', async () => {
    const user = userEvent.setup();
    render(<OTPInput length={6} />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[0]);
    await user.paste('123456');

    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('3');
    expect(inputs[3]).toHaveValue('4');
    expect(inputs[4]).toHaveValue('5');
    expect(inputs[5]).toHaveValue('6');
  });

  it('strips non-numeric characters from pasted content', async () => {
    const user = userEvent.setup();
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[0]);
    await user.paste('1 2-3 4');

    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('3');
    expect(inputs[3]).toHaveValue('4');
  });

  it('accepts paste on any field, not just the first', async () => {
    const user = userEvent.setup();
    render(<OTPInput length={4} />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[2]);
    await user.paste('5678');

    expect(inputs[0]).toHaveValue('5');
    expect(inputs[1]).toHaveValue('6');
    expect(inputs[2]).toHaveValue('7');
    expect(inputs[3]).toHaveValue('8');
  });
});

// ─── Callbacks ────────────────────────────────────────────────────────────────

describe('OTPInput — callbacks', () => {
  it('calls onChange on every digit change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OTPInput onChange={onChange} />);

    await user.click(screen.getByRole('textbox', { name: 'Digit 1 of 6' }));
    await user.keyboard('4');

    expect(onChange).toHaveBeenCalledWith('4');
  });

  it('calls onComplete only when all digits are filled', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OTPInput length={4} onComplete={onComplete} />);
    const inputs = screen.getAllByRole('textbox');

    await user.click(inputs[0]);
    await user.keyboard('1234');

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('calls onComplete when code is completed via paste', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OTPInput length={4} onComplete={onComplete} />);

    await user.click(screen.getAllByRole('textbox')[0]);
    await user.paste('5678');

    expect(onComplete).toHaveBeenCalledWith('5678');
  });

  it('does not call onComplete when fewer digits than length are pasted', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OTPInput length={6} onComplete={onComplete} />);

    await user.click(screen.getAllByRole('textbox')[0]);
    await user.paste('123');

    expect(onComplete).not.toHaveBeenCalled();
  });
});

// ─── Disabled state ───────────────────────────────────────────────────────────

describe('OTPInput — disabled state', () => {
  it('disables all inputs when disabled prop is set', () => {
    render(<OTPInput disabled />);
    screen.getAllByRole('textbox').forEach((input) => {
      expect(input).toBeDisabled();
    });
  });
});
