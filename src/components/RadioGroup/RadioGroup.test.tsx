import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { RadioGroup } from './RadioGroup';
import type { RadioOption } from './RadioGroup';

const DEFAULT_OPTIONS: RadioOption[] = [
  { value: 'personal',  label: 'Personal account',  hint: 'For everyday banking' },
  { value: 'joint',     label: 'Joint account',      hint: 'Shared with another person' },
  { value: 'business',  label: 'Business account',   hint: 'For sole traders and limited companies' },
];

function renderRadioGroup(props: Partial<React.ComponentProps<typeof RadioGroup>> = {}) {
  return render(
    <RadioGroup
      legend="Account type"
      name="account-type"
      options={DEFAULT_OPTIONS}
      {...props}
    />,
  );
}

function getRadio(label: string) {
  return screen.getByRole('radio', { name: new RegExp(label, 'i') });
}

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('RadioGroup — axe', () => {
  it('has no violations in default state', async () => {
    const { container } = renderRadioGroup();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a hint', async () => {
    const { container } = renderRadioGroup({ hint: 'Choose the account type that suits you.' });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = renderRadioGroup({ errorMessage: 'Select an account type.' });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when required', async () => {
    const { container } = renderRadioGroup({ required: true });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when disabled', async () => {
    const { container } = renderRadioGroup({ disabled: true });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a selected value', async () => {
    const { container } = renderRadioGroup({
      value: 'personal',
      onChange: vi.fn(),
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Fieldset / legend (1.3.1, 3.3.2) ────────────────────────────────────────

describe('RadioGroup — fieldset and legend (1.3.1, 3.3.2)', () => {
  it('renders a <fieldset>', () => {
    renderRadioGroup();
    expect(document.querySelector('fieldset')).toBeInTheDocument();
  });

  it('renders a <legend> with the provided text', () => {
    renderRadioGroup();
    expect(screen.getByText('Account type', { selector: 'legend' })).toBeInTheDocument();
  });

  it('renders a radio input for each option', () => {
    renderRadioGroup();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('each radio has an associated label', () => {
    renderRadioGroup();
    expect(getRadio('Personal account')).toBeInTheDocument();
    expect(getRadio('Joint account')).toBeInTheDocument();
    expect(getRadio('Business account')).toBeInTheDocument();
  });
});

// ─── Controlled value ─────────────────────────────────────────────────────────

describe('RadioGroup — controlled value', () => {
  it('checks the radio matching the value prop', () => {
    renderRadioGroup({ value: 'joint', onChange: vi.fn() });
    expect(getRadio('Joint account')).toBeChecked();
  });

  it('unchecked radios are not checked', () => {
    renderRadioGroup({ value: 'joint', onChange: vi.fn() });
    expect(getRadio('Personal account')).not.toBeChecked();
    expect(getRadio('Business account')).not.toBeChecked();
  });

  it('no radio is checked when value is undefined', () => {
    renderRadioGroup();
    screen.getAllByRole('radio').forEach((r) => expect(r).not.toBeChecked());
  });
});

// ─── onChange ─────────────────────────────────────────────────────────────────

describe('RadioGroup — onChange', () => {
  it('calls onChange with the selected value', () => {
    const onChange = vi.fn();
    renderRadioGroup({ onChange });
    fireEvent.click(getRadio('Joint account'));
    expect(onChange).toHaveBeenCalledWith('joint');
  });

  it('calls onChange when a different option is selected', () => {
    const onChange = vi.fn();
    renderRadioGroup({ value: 'personal', onChange });
    fireEvent.click(getRadio('Business account'));
    expect(onChange).toHaveBeenCalledWith('business');
  });
});

// ─── Hint text ────────────────────────────────────────────────────────────────

describe('RadioGroup — hint text', () => {
  it('renders group hint when provided', () => {
    renderRadioGroup({ hint: 'Choose the account type that suits you.' });
    expect(screen.getByText('Choose the account type that suits you.')).toBeInTheDocument();
  });

  it('links group hint to all inputs via aria-describedby', () => {
    renderRadioGroup({ hint: 'Choose the account type that suits you.' });
    const hint = screen.getByText('Choose the account type that suits you.');
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio.getAttribute('aria-describedby')).toContain(hint.id);
    });
  });

  it('renders option-level hint when provided', () => {
    renderRadioGroup();
    expect(screen.getByText('For everyday banking')).toBeInTheDocument();
  });
});

// ─── Error state (3.3.1, 1.4.1, 4.1.2, 4.1.3) ───────────────────────────────

describe('RadioGroup — error state (3.3.1, 4.1.2)', () => {
  it('sets aria-invalid on all inputs when errorMessage is provided', () => {
    renderRadioGroup({ errorMessage: 'Select an account type.' });
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('does not set aria-invalid when there is no error', () => {
    renderRadioGroup();
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).not.toHaveAttribute('aria-invalid');
    });
  });

  it('links error to all inputs via aria-describedby', () => {
    renderRadioGroup({ errorMessage: 'Select an account type.' });
    const errorEl = screen
      .getAllByText('Select an account type.', { exact: false })
      .find((el) => el.tagName === 'P')!;
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio.getAttribute('aria-describedby')).toContain(errorEl.id);
    });
  });

  it('renders error with ⚠ icon — color not sole indicator (1.4.1)', () => {
    renderRadioGroup({ errorMessage: 'Select an account type.' });
    const errorEl = screen
      .getAllByText('Select an account type.', { exact: false })
      .find((el) => el.tagName === 'P')!;
    expect(errorEl.textContent).toContain('⚠');
  });

  it('populates the polite live region with the error message (4.1.3)', () => {
    renderRadioGroup({ errorMessage: 'Select an account type.' });
    const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion?.textContent).toContain('Select an account type.');
  });
});

// ─── Required (4.1.2) ─────────────────────────────────────────────────────────

describe('RadioGroup — required (4.1.2)', () => {
  it('marks all inputs as required when required prop is set', () => {
    renderRadioGroup({ required: true });
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toBeRequired();
    });
  });

  it('asterisk in legend is aria-hidden', () => {
    renderRadioGroup({ required: true });
    const asterisk = document.querySelector('legend [aria-hidden="true"]');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk?.textContent).toContain('*');
  });
});

// ─── Disabled (4.1.2) ─────────────────────────────────────────────────────────

describe('RadioGroup — disabled (4.1.2)', () => {
  it('disables all inputs when disabled prop is set', () => {
    renderRadioGroup({ disabled: true });
    screen.getAllByRole('radio').forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  it('disables a single option when option.disabled is set', () => {
    const options: RadioOption[] = [
      { value: 'personal', label: 'Personal account' },
      { value: 'joint',    label: 'Joint account', disabled: true },
      { value: 'business', label: 'Business account' },
    ];
    renderRadioGroup({ options });
    expect(getRadio('Joint account')).toBeDisabled();
    expect(getRadio('Personal account')).not.toBeDisabled();
  });
});

// ─── Keyboard operability (2.1.1) ─────────────────────────────────────────────

describe('RadioGroup — keyboard operability (2.1.1)', () => {
  it('first radio is reachable by Tab', async () => {
    const user = userEvent.setup();
    renderRadioGroup();
    await user.tab();
    expect(getRadio('Personal account')).toHaveFocus();
  });

  it('selected radio is focused on Tab when a value is set', async () => {
    const user = userEvent.setup();
    renderRadioGroup({ value: 'joint', onChange: vi.fn() });
    await user.tab();
    expect(getRadio('Joint account')).toHaveFocus();
  });

  it('ArrowDown moves focus to the next radio', async () => {
    const user = userEvent.setup();
    renderRadioGroup();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(getRadio('Joint account')).toHaveFocus();
  });

  it('ArrowUp moves focus to the previous radio', async () => {
    const user = userEvent.setup();
    renderRadioGroup({ value: 'joint', onChange: vi.fn() });
    await user.tab();
    await user.keyboard('{ArrowUp}');
    expect(getRadio('Personal account')).toHaveFocus();
  });
});
