import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox, CheckboxGroup } from './Checkbox';
import type { CheckboxOption } from './Checkbox';

// ═══════════════════════════════════════════════════════════════════════════════
// Checkbox
// ═══════════════════════════════════════════════════════════════════════════════

function renderCheckbox(props: Partial<React.ComponentProps<typeof Checkbox>> = {}) {
  return render(<Checkbox label="I agree to the terms and conditions" {...props} />);
}

function getCheckbox() {
  return screen.getByRole('checkbox');
}

// ─── Axe — Checkbox ───────────────────────────────────────────────────────────

describe('Checkbox — axe', () => {
  it('has no violations in default state', async () => {
    const { container } = renderCheckbox();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when checked', async () => {
    const { container } = renderCheckbox({ checked: true, onChange: vi.fn() });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when indeterminate', async () => {
    const { container } = renderCheckbox({ indeterminate: true, onChange: vi.fn() });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a hint', async () => {
    const { container } = renderCheckbox({ hint: 'You must agree to continue.' });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = renderCheckbox({ errorMessage: 'You must accept the terms.' });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when required', async () => {
    const { container } = renderCheckbox({ required: true });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when disabled', async () => {
    const { container } = renderCheckbox({ disabled: true });
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Label association (1.3.1) ────────────────────────────────────────────────

describe('Checkbox — label association (1.3.1)', () => {
  it('renders a checkbox with an associated label', () => {
    renderCheckbox();
    expect(screen.getByRole('checkbox', { name: /I agree to the terms/i })).toBeInTheDocument();
  });
});

// ─── Checked state ────────────────────────────────────────────────────────────

describe('Checkbox — checked state', () => {
  it('is unchecked by default', () => {
    renderCheckbox();
    expect(getCheckbox()).not.toBeChecked();
  });

  it('reflects the checked prop', () => {
    renderCheckbox({ checked: true, onChange: vi.fn() });
    expect(getCheckbox()).toBeChecked();
  });

  it('calls onChange with true when checked', () => {
    const onChange = vi.fn();
    renderCheckbox({ onChange });
    fireEvent.click(getCheckbox());
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when unchecked', () => {
    const onChange = vi.fn();
    renderCheckbox({ checked: true, onChange });
    fireEvent.click(getCheckbox());
    expect(onChange).toHaveBeenCalledWith(false);
  });
});

// ─── Indeterminate state (4.1.2) ──────────────────────────────────────────────

describe('Checkbox — indeterminate (4.1.2)', () => {
  it('sets the DOM indeterminate property when indeterminate=true', () => {
    renderCheckbox({ indeterminate: true });
    expect((getCheckbox() as HTMLInputElement).indeterminate).toBe(true);
  });

  it('clears the DOM indeterminate property when indeterminate=false', () => {
    renderCheckbox({ indeterminate: false });
    expect((getCheckbox() as HTMLInputElement).indeterminate).toBe(false);
  });
});

// ─── Hint and error (3.3.1, 3.3.2, 4.1.2) ────────────────────────────────────

describe('Checkbox — hint and error', () => {
  it('renders hint text when provided', () => {
    renderCheckbox({ hint: 'You must agree to continue.' });
    expect(screen.getByText('You must agree to continue.')).toBeInTheDocument();
  });

  it('links hint to input via aria-describedby', () => {
    renderCheckbox({ hint: 'You must agree to continue.' });
    const hint = screen.getByText('You must agree to continue.');
    expect(getCheckbox().getAttribute('aria-describedby')).toContain(hint.id);
  });

  it('sets aria-invalid when errorMessage is provided', () => {
    renderCheckbox({ errorMessage: 'You must accept the terms.' });
    expect(getCheckbox()).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when no error', () => {
    renderCheckbox();
    expect(getCheckbox()).not.toHaveAttribute('aria-invalid');
  });

  it('renders error with ⚠ icon — color not sole indicator (1.4.1)', () => {
    renderCheckbox({ errorMessage: 'You must accept the terms.' });
    const errorEl = screen
      .getAllByText('You must accept the terms.', { exact: false })
      .find((el) => el.tagName === 'P')!;
    expect(errorEl.textContent).toContain('⚠');
  });

  it('populates the polite live region with the error (4.1.3)', () => {
    renderCheckbox({ errorMessage: 'You must accept the terms.' });
    const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion?.textContent).toContain('You must accept the terms.');
  });
});

// ─── Required / disabled ──────────────────────────────────────────────────────

describe('Checkbox — required and disabled', () => {
  it('is required when required prop is set', () => {
    renderCheckbox({ required: true });
    expect(getCheckbox()).toBeRequired();
  });

  it('asterisk is aria-hidden', () => {
    renderCheckbox({ required: true });
    const asterisk = document.querySelector('[aria-hidden="true"]');
    expect(asterisk?.textContent).toContain('*');
  });

  it('is disabled when disabled prop is set', () => {
    renderCheckbox({ disabled: true });
    expect(getCheckbox()).toBeDisabled();
  });
});

// ─── Keyboard (2.1.1) ─────────────────────────────────────────────────────────

describe('Checkbox — keyboard (2.1.1)', () => {
  it('checkbox is reachable by Tab', async () => {
    const user = userEvent.setup();
    renderCheckbox();
    await user.tab();
    expect(getCheckbox()).toHaveFocus();
  });

  it('Space toggles the checkbox', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderCheckbox({ onChange });
    await user.tab();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CheckboxGroup
// ═══════════════════════════════════════════════════════════════════════════════

const GROUP_OPTIONS: CheckboxOption[] = [
  { value: 'email',  label: 'Email notifications',  hint: 'Receive updates by email' },
  { value: 'sms',    label: 'SMS notifications',     hint: 'Receive updates by text' },
  { value: 'push',   label: 'Push notifications',    hint: 'Receive updates in the app' },
];

function renderGroup(props: Partial<React.ComponentProps<typeof CheckboxGroup>> = {}) {
  return render(
    <CheckboxGroup
      legend="Notification preferences"
      options={GROUP_OPTIONS}
      {...props}
    />,
  );
}

function getOption(name: string) {
  return screen.getByRole('checkbox', { name: new RegExp(name, 'i') });
}

// ─── Axe — CheckboxGroup ──────────────────────────────────────────────────────

describe('CheckboxGroup — axe', () => {
  it('has no violations in default state', async () => {
    const { container } = renderGroup();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with selected values', async () => {
    const { container } = renderGroup({ value: ['email', 'sms'], onChange: vi.fn() });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = renderGroup({ errorMessage: 'Select at least one option.' });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with showSelectAll', async () => {
    const { container } = renderGroup({ showSelectAll: true, value: ['email'], onChange: vi.fn() });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when disabled', async () => {
    const { container } = renderGroup({ disabled: true });
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Fieldset / legend (1.3.1) ────────────────────────────────────────────────

describe('CheckboxGroup — fieldset and legend (1.3.1)', () => {
  it('renders a <fieldset>', () => {
    renderGroup();
    expect(document.querySelector('fieldset')).toBeInTheDocument();
  });

  it('renders a <legend> with the provided text', () => {
    renderGroup();
    expect(screen.getByText('Notification preferences', { selector: 'legend' })).toBeInTheDocument();
  });

  it('renders a checkbox for each option', () => {
    renderGroup();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });
});

// ─── Controlled value ─────────────────────────────────────────────────────────

describe('CheckboxGroup — controlled value', () => {
  it('checks options matching the value array', () => {
    renderGroup({ value: ['email', 'push'], onChange: vi.fn() });
    expect(getOption('Email notifications')).toBeChecked();
    expect(getOption('Push notifications')).toBeChecked();
    expect(getOption('SMS notifications')).not.toBeChecked();
  });

  it('calls onChange with the added value when an option is checked', () => {
    const onChange = vi.fn();
    renderGroup({ value: ['email'], onChange });
    fireEvent.click(getOption('SMS notifications'));
    expect(onChange).toHaveBeenCalledWith(expect.arrayContaining(['email', 'sms']));
  });

  it('calls onChange with the removed value when an option is unchecked', () => {
    const onChange = vi.fn();
    renderGroup({ value: ['email', 'sms'], onChange });
    fireEvent.click(getOption('Email notifications'));
    expect(onChange).toHaveBeenCalledWith(['sms']);
  });
});

// ─── Select all / indeterminate (4.1.2) ───────────────────────────────────────

describe('CheckboxGroup — select all and indeterminate (4.1.2)', () => {
  it('select-all is unchecked when no options are selected', () => {
    renderGroup({ showSelectAll: true, value: [], onChange: vi.fn() });
    expect(screen.getByRole('checkbox', { name: /select all/i })).not.toBeChecked();
  });

  it('select-all is checked when all options are selected', () => {
    renderGroup({ showSelectAll: true, value: ['email', 'sms', 'push'], onChange: vi.fn() });
    expect(screen.getByRole('checkbox', { name: /select all/i })).toBeChecked();
  });

  it('select-all is indeterminate when some options are selected', () => {
    renderGroup({ showSelectAll: true, value: ['email'], onChange: vi.fn() });
    const selectAll = screen.getByRole('checkbox', { name: /select all/i }) as HTMLInputElement;
    expect(selectAll.indeterminate).toBe(true);
  });

  it('checking select-all selects all enabled options', () => {
    const onChange = vi.fn();
    renderGroup({ showSelectAll: true, value: [], onChange });
    fireEvent.click(screen.getByRole('checkbox', { name: /select all/i }));
    expect(onChange).toHaveBeenCalledWith(['email', 'sms', 'push']);
  });

  it('unchecking select-all deselects all options', () => {
    const onChange = vi.fn();
    renderGroup({ showSelectAll: true, value: ['email', 'sms', 'push'], onChange });
    fireEvent.click(screen.getByRole('checkbox', { name: /select all/i }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

// ─── Error state (3.3.1, 4.1.2, 4.1.3) ──────────────────────────────────────

describe('CheckboxGroup — error state', () => {
  it('sets aria-invalid on all option inputs', () => {
    renderGroup({ errorMessage: 'Select at least one option.' });
    screen.getAllByRole('checkbox').forEach((cb) => {
      expect(cb).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('links error to all inputs via aria-describedby', () => {
    renderGroup({ errorMessage: 'Select at least one option.' });
    const errorEl = screen
      .getAllByText('Select at least one option.', { exact: false })
      .find((el) => el.tagName === 'P')!;
    screen.getAllByRole('checkbox').forEach((cb) => {
      expect(cb.getAttribute('aria-describedby')).toContain(errorEl.id);
    });
  });

  it('populates the polite live region (4.1.3)', () => {
    renderGroup({ errorMessage: 'Select at least one option.' });
    const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion?.textContent).toContain('Select at least one option.');
  });
});

// ─── Keyboard (2.1.1) ─────────────────────────────────────────────────────────

describe('CheckboxGroup — keyboard (2.1.1)', () => {
  it('first checkbox is reachable by Tab', async () => {
    const user = userEvent.setup();
    renderGroup();
    await user.tab();
    expect(getOption('Email notifications')).toHaveFocus();
  });

  it('all checkboxes are in the tab order', async () => {
    const user = userEvent.setup();
    renderGroup();
    await user.tab();
    expect(getOption('Email notifications')).toHaveFocus();
    await user.tab();
    expect(getOption('SMS notifications')).toHaveFocus();
    await user.tab();
    expect(getOption('Push notifications')).toHaveFocus();
  });
});
