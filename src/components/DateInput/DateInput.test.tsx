import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { DateInput } from './DateInput';

function renderDateInput(props: Partial<React.ComponentProps<typeof DateInput>> = {}) {
  return render(<DateInput legend="Date of birth" {...props} />);
}

function getDay()   { return screen.getByLabelText(/^day$/i); }
function getMonth() { return screen.getByLabelText(/^month$/i); }
function getYear()  { return screen.getByLabelText(/^year$/i); }

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('DateInput — axe', () => {
  it('has no violations in default state', async () => {
    const { container } = renderDateInput();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with hint text', async () => {
    const { container } = renderDateInput({ hint: 'For example, 15 03 1990' });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = renderDateInput({ errorMessage: 'Enter a valid date of birth.' });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when required', async () => {
    const { container } = renderDateInput({ required: true });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when disabled', async () => {
    const { container } = renderDateInput({ disabled: true });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a pre-populated value', async () => {
    const { container } = renderDateInput({
      value: { day: '15', month: '03', year: '1990' },
      onChange: vi.fn(),
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Fieldset / legend grouping (1.3.1, 3.3.2) ───────────────────────────────

describe('DateInput — fieldset and legend (1.3.1, 3.3.2)', () => {
  it('renders a <fieldset>', () => {
    renderDateInput();
    expect(document.querySelector('fieldset')).toBeInTheDocument();
  });

  it('renders a <legend> with the provided text', () => {
    renderDateInput();
    expect(screen.getByText('Date of birth', { selector: 'legend' })).toBeInTheDocument();
  });

  it('associates each input with its own label', () => {
    renderDateInput();
    expect(getDay()).toBeInTheDocument();
    expect(getMonth()).toBeInTheDocument();
    expect(getYear()).toBeInTheDocument();
  });
});

// ─── Input attributes (4.1.2) ─────────────────────────────────────────────────

describe('DateInput — input attributes (4.1.2)', () => {
  it('sets inputmode="numeric" on all three inputs', () => {
    renderDateInput();
    expect(getDay()).toHaveAttribute('inputmode', 'numeric');
    expect(getMonth()).toHaveAttribute('inputmode', 'numeric');
    expect(getYear()).toHaveAttribute('inputmode', 'numeric');
  });

  it('sets maxLength=2 on day and month, maxLength=4 on year', () => {
    renderDateInput();
    expect(getDay()).toHaveAttribute('maxlength', '2');
    expect(getMonth()).toHaveAttribute('maxlength', '2');
    expect(getYear()).toHaveAttribute('maxlength', '4');
  });

  it('sets the correct placeholders', () => {
    renderDateInput();
    expect(getDay()).toHaveAttribute('placeholder', 'DD');
    expect(getMonth()).toHaveAttribute('placeholder', 'MM');
    expect(getYear()).toHaveAttribute('placeholder', 'YYYY');
  });
});

// ─── Auto-advance (2.1.1) ─────────────────────────────────────────────────────

describe('DateInput — auto-advance (2.1.1)', () => {
  it('moves focus to month when day reaches 2 digits', () => {
    renderDateInput();
    fireEvent.change(getDay(), { target: { value: '15' } });
    expect(getMonth()).toHaveFocus();
  });

  it('moves focus to year when month reaches 2 digits', () => {
    renderDateInput();
    fireEvent.change(getMonth(), { target: { value: '03' } });
    expect(getYear()).toHaveFocus();
  });

  it('does not advance focus when day has fewer than 2 digits', () => {
    renderDateInput();
    getDay().focus();
    fireEvent.change(getDay(), { target: { value: '1' } });
    expect(getDay()).toHaveFocus();
  });
});

// ─── Backspace navigation (2.1.1) ─────────────────────────────────────────────

describe('DateInput — backspace navigation (2.1.1)', () => {
  it('moves focus to day when Backspace pressed in empty month', () => {
    renderDateInput();
    getMonth().focus();
    fireEvent.keyDown(getMonth(), { key: 'Backspace' });
    expect(getDay()).toHaveFocus();
  });

  it('moves focus to month when Backspace pressed in empty year', () => {
    renderDateInput();
    getYear().focus();
    fireEvent.keyDown(getYear(), { key: 'Backspace' });
    expect(getMonth()).toHaveFocus();
  });

  it('does not move focus on Backspace when month has content', () => {
    renderDateInput();
    fireEvent.change(getMonth(), { target: { value: '0' } });
    getMonth().focus();
    fireEvent.keyDown(getMonth(), { key: 'Backspace' });
    expect(getMonth()).toHaveFocus();
  });
});

// ─── Input filtering ──────────────────────────────────────────────────────────

describe('DateInput — input filtering', () => {
  it('strips non-numeric characters from day', () => {
    renderDateInput();
    fireEvent.change(getDay(), { target: { value: 'ab15' } });
    expect(getDay()).toHaveValue('15');
  });

  it('strips non-numeric characters from month', () => {
    renderDateInput();
    fireEvent.change(getMonth(), { target: { value: 'march' } });
    expect(getMonth()).toHaveValue('');
  });

  it('strips non-numeric characters from year', () => {
    renderDateInput();
    fireEvent.change(getYear(), { target: { value: '19x0' } });
    expect(getYear()).toHaveValue('190');
  });
});

// ─── onChange callback ────────────────────────────────────────────────────────

describe('DateInput — onChange', () => {
  it('calls onChange with the full DateValue when day changes', () => {
    const onChange = vi.fn();
    renderDateInput({ onChange });
    fireEvent.change(getDay(), { target: { value: '15' } });
    expect(onChange).toHaveBeenCalledWith({ day: '15', month: '', year: '' });
  });

  it('calls onChange with the full DateValue when month changes', () => {
    const onChange = vi.fn();
    renderDateInput({ onChange });
    fireEvent.change(getMonth(), { target: { value: '03' } });
    expect(onChange).toHaveBeenCalledWith({ day: '', month: '03', year: '' });
  });

  it('calls onChange with the full DateValue when year changes', () => {
    const onChange = vi.fn();
    renderDateInput({ onChange });
    fireEvent.change(getYear(), { target: { value: '1990' } });
    expect(onChange).toHaveBeenCalledWith({ day: '', month: '', year: '1990' });
  });

  it('displays a pre-populated controlled value', () => {
    renderDateInput({
      value: { day: '15', month: '03', year: '1990' },
      onChange: vi.fn(),
    });
    expect(getDay()).toHaveValue('15');
    expect(getMonth()).toHaveValue('03');
    expect(getYear()).toHaveValue('1990');
  });
});

// ─── Error state (3.3.1, 1.4.1, 4.1.2, 4.1.3) ───────────────────────────────

describe('DateInput — error state (3.3.1, 4.1.2)', () => {
  it('sets aria-invalid on all three inputs when errorMessage is provided', () => {
    renderDateInput({ errorMessage: 'Enter a valid date.' });
    expect(getDay()).toHaveAttribute('aria-invalid', 'true');
    expect(getMonth()).toHaveAttribute('aria-invalid', 'true');
    expect(getYear()).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when there is no error', () => {
    renderDateInput();
    expect(getDay()).not.toHaveAttribute('aria-invalid');
    expect(getMonth()).not.toHaveAttribute('aria-invalid');
    expect(getYear()).not.toHaveAttribute('aria-invalid');
  });

  it('links the error to all inputs via aria-describedby', () => {
    renderDateInput({ errorMessage: 'Enter a valid date.' });
    const errorPara = screen
      .getAllByText('Enter a valid date.', { exact: false })
      .find((el) => el.tagName === 'P')!;
    expect(getDay().getAttribute('aria-describedby')).toContain(errorPara.id);
    expect(getMonth().getAttribute('aria-describedby')).toContain(errorPara.id);
    expect(getYear().getAttribute('aria-describedby')).toContain(errorPara.id);
  });

  it('renders the error with an icon — color not the sole indicator (1.4.1)', () => {
    renderDateInput({ errorMessage: 'Enter a valid date.' });
    const errorPara = screen
      .getAllByText('Enter a valid date.', { exact: false })
      .find((el) => el.tagName === 'P')!;
    expect(errorPara.textContent).toContain('⚠');
  });

  it('populates the polite live region with the error message (4.1.3)', () => {
    renderDateInput({ errorMessage: 'Enter a valid date.' });
    const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion?.textContent).toContain('Enter a valid date.');
  });
});

// ─── Hint text ────────────────────────────────────────────────────────────────

describe('DateInput — hint text', () => {
  it('renders hint text when provided', () => {
    renderDateInput({ hint: 'For example, 15 03 1990' });
    expect(screen.getByText('For example, 15 03 1990')).toBeInTheDocument();
  });

  it('links the hint to all inputs via aria-describedby', () => {
    renderDateInput({ hint: 'For example, 15 03 1990' });
    const hint = screen.getByText('For example, 15 03 1990');
    expect(getDay().getAttribute('aria-describedby')).toContain(hint.id);
    expect(getMonth().getAttribute('aria-describedby')).toContain(hint.id);
    expect(getYear().getAttribute('aria-describedby')).toContain(hint.id);
  });
});

// ─── Required / disabled ──────────────────────────────────────────────────────

describe('DateInput — required and disabled', () => {
  it('marks all inputs as required when required prop is set', () => {
    renderDateInput({ required: true });
    expect(getDay()).toBeRequired();
    expect(getMonth()).toBeRequired();
    expect(getYear()).toBeRequired();
  });

  it('disables all inputs when disabled prop is set', () => {
    renderDateInput({ disabled: true });
    expect(getDay()).toBeDisabled();
    expect(getMonth()).toBeDisabled();
    expect(getYear()).toBeDisabled();
  });
});

// ─── Keyboard operability (2.1.1) ─────────────────────────────────────────────

describe('DateInput — keyboard operability (2.1.1)', () => {
  it('day input can be reached by Tab', async () => {
    const user = userEvent.setup();
    renderDateInput();
    await user.tab();
    expect(getDay()).toHaveFocus();
  });

  it('all three inputs are in the tab order', async () => {
    const user = userEvent.setup();
    renderDateInput();
    await user.tab();
    expect(getDay()).toHaveFocus();
    await user.tab();
    expect(getMonth()).toHaveFocus();
    await user.tab();
    expect(getYear()).toHaveFocus();
  });
});
