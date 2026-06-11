import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { PasswordInput } from './PasswordInput';

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('PasswordInput — axe', () => {
  it('has no violations in default state', async () => {
    const { container } = render(<PasswordInput label="Password" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with hint text', async () => {
    const { container } = render(
      <PasswordInput label="Password" hint="Must be at least 12 characters." />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = render(
      <PasswordInput label="Password" errorMessage="Password must be at least 12 characters." />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when required', async () => {
    const { container } = render(<PasswordInput label="Password" required />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when disabled', async () => {
    const { container } = render(<PasswordInput label="Password" disabled />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when password is visible', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput label="Password" />);
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Label association ─────────────────────────────────────────────────────────

describe('PasswordInput — label association (1.3.1, 3.3.2)', () => {
  it('associates the label with the input via htmlFor/id', () => {
    render(<PasswordInput label="Password" />);
    // password inputs have role="textbox" when type=text but not when type=password
    // query via label text instead
    const input = document.querySelector('input');
    const label = screen.getByText('Password', { selector: 'label' });
    expect(label).toHaveAttribute('for', input?.id);
  });

  it('renders a visible <label> element — not a placeholder substitute', () => {
    render(<PasswordInput label="Current password" />);
    expect(screen.getByText('Current password', { selector: 'label' })).toBeInTheDocument();
  });
});

// ─── Toggle button — accessible name & state ──────────────────────────────────

describe('PasswordInput — toggle accessible name & state (4.1.2, 2.5.3)', () => {
  it('renders a button with accessible name "Show password" when password is hidden', () => {
    render(<PasswordInput label="Password" />);
    expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
  });

  it('accessible name changes to "Hide password" when password is shown', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" />);
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
  });

  it('toggle has aria-pressed="false" when password is hidden', () => {
    render(<PasswordInput label="Password" />);
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('toggle has aria-pressed="true" when password is shown', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" />);
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('toggle is a <button type="button"> — not a submit button', () => {
    render(<PasswordInput label="Password" />);
    const btn = screen.getByRole('button', { name: 'Show password' });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveAttribute('type', 'button');
  });
});

// ─── Toggle behaviour ─────────────────────────────────────────────────────────

describe('PasswordInput — toggle behaviour (3.3.8, 2.4.7)', () => {
  it('input type is "password" by default', () => {
    render(<PasswordInput label="Password" />);
    expect(document.querySelector('input')).toHaveAttribute('type', 'password');
  });

  it('input type changes to "text" after clicking Show password', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" />);
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(document.querySelector('input')).toHaveAttribute('type', 'text');
  });

  it('input type returns to "password" after clicking Hide password', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" />);
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    await user.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(document.querySelector('input')).toHaveAttribute('type', 'password');
  });

  it('focus stays on the toggle button after activation — does not move to input (2.4.7)', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" />);
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    // After click, focus must remain on the button (now labelled "Hide password")
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveFocus();
  });

  it('toggle can be activated with Enter key', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" />);
    screen.getByRole('button', { name: 'Show password' }).focus();
    await user.keyboard('{Enter}');
    expect(document.querySelector('input')).toHaveAttribute('type', 'text');
  });

  it('toggle can be activated with Space key', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" />);
    screen.getByRole('button', { name: 'Show password' }).focus();
    await user.keyboard(' ');
    expect(document.querySelector('input')).toHaveAttribute('type', 'text');
  });
});

// ─── Paste — 3.3.8 Accessible Authentication ─────────────────────────────────

describe('PasswordInput — paste (3.3.8)', () => {
  it('allows pasting into the input when type is password', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" />);
    const input = document.querySelector('input')!;
    await user.click(input);
    await user.paste('MyS3cur3P@ssword!');
    expect(input).toHaveValue('MyS3cur3P@ssword!');
  });

  it('allows pasting into the input when type is text (visible)', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" />);
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    const input = document.querySelector('input')!;
    await user.click(input);
    await user.paste('MyS3cur3P@ssword!');
    expect(input).toHaveValue('MyS3cur3P@ssword!');
  });
});

// ─── autocomplete ─────────────────────────────────────────────────────────────

describe('PasswordInput — autocomplete (3.3.8)', () => {
  it('defaults to autocomplete="current-password"', () => {
    render(<PasswordInput label="Password" />);
    expect(document.querySelector('input')).toHaveAttribute('autocomplete', 'current-password');
  });

  it('accepts autocomplete="new-password"', () => {
    render(<PasswordInput label="New password" autoComplete="new-password" />);
    expect(document.querySelector('input')).toHaveAttribute('autocomplete', 'new-password');
  });
});

// ─── Error state ──────────────────────────────────────────────────────────────

describe('PasswordInput — error state (3.3.1, 1.4.1, 4.1.2, 4.1.3)', () => {
  it('sets aria-invalid on the input when errorMessage is provided', () => {
    render(<PasswordInput label="Password" errorMessage="Password is too short." />);
    expect(document.querySelector('input')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when there is no error', () => {
    render(<PasswordInput label="Password" />);
    expect(document.querySelector('input')).not.toHaveAttribute('aria-invalid');
  });

  it('links the error to the input via aria-describedby', () => {
    render(<PasswordInput label="Password" errorMessage="Password is too short." />);
    const input = document.querySelector('input')!;
    const errorPara = screen
      .getAllByText('Password is too short.', { exact: false })
      .find((el) => el.tagName === 'P')!;
    expect(input.getAttribute('aria-describedby')).toContain(errorPara.id);
  });

  it('renders the error with an icon (color is not the sole indicator — 1.4.1)', () => {
    render(<PasswordInput label="Password" errorMessage="Password is too short." />);
    const errorPara = screen
      .getAllByText('Password is too short.', { exact: false })
      .find((el) => el.tagName === 'P')!;
    expect(errorPara.textContent).toContain('⚠');
  });

  it('populates the polite live region with the error message (4.1.3)', () => {
    render(<PasswordInput label="Password" errorMessage="Password is too short." />);
    const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion?.textContent).toContain('Password is too short.');
  });
});

// ─── Hint text ────────────────────────────────────────────────────────────────

describe('PasswordInput — hint text', () => {
  it('renders hint text when provided', () => {
    render(<PasswordInput label="Password" hint="Must be at least 12 characters." />);
    expect(screen.getByText('Must be at least 12 characters.')).toBeInTheDocument();
  });

  it('links the hint to the input via aria-describedby', () => {
    render(<PasswordInput label="Password" hint="Must be at least 12 characters." />);
    const input = document.querySelector('input')!;
    const hintEl = screen.getByText('Must be at least 12 characters.');
    expect(input.getAttribute('aria-describedby')).toContain(hintEl.id);
  });
});

// ─── Disabled state ───────────────────────────────────────────────────────────

describe('PasswordInput — disabled state', () => {
  it('disables the input when disabled prop is set', () => {
    render(<PasswordInput label="Password" disabled />);
    expect(document.querySelector('input')).toBeDisabled();
  });

  it('disables the toggle button when disabled prop is set', () => {
    render(<PasswordInput label="Password" disabled />);
    expect(screen.getByRole('button', { name: 'Show password' })).toBeDisabled();
  });
});

// ─── Required ─────────────────────────────────────────────────────────────────

describe('PasswordInput — required', () => {
  it('marks the input as required', () => {
    render(<PasswordInput label="Password" required />);
    expect(document.querySelector('input')).toBeRequired();
  });
});

// ─── Keyboard navigation ──────────────────────────────────────────────────────

describe('PasswordInput — keyboard navigation', () => {
  it('Tab reaches the input', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" />);
    await user.tab();
    expect(document.querySelector('input')).toHaveFocus();
  });

  it('Tab from input moves focus to the toggle button', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" />);
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveFocus();
  });

  it('calls onChange when user types in the input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PasswordInput label="Password" onChange={onChange} />);
    await user.click(document.querySelector('input')!);
    await user.keyboard('secret');
    expect(onChange).toHaveBeenCalled();
  });
});
