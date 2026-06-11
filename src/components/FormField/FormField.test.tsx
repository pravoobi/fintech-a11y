import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { FormField } from './FormField';

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('FormField — axe', () => {
  it('has no violations in default state', async () => {
    const { container } = render(<FormField label="Email address" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with hint text', async () => {
    const { container } = render(
      <FormField label="Email address" hint="We'll send your statement here" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in error state', async () => {
    const { container } = render(
      <FormField label="Email address" errorMessage="Enter a valid email address." />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when required', async () => {
    const { container } = render(<FormField label="Email address" required />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when disabled', async () => {
    const { container } = render(<FormField label="Email address" disabled />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with hint and error together', async () => {
    const { container } = render(
      <FormField
        label="Email address"
        hint="We'll send your statement here"
        errorMessage="Enter a valid email address."
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Label association ─────────────────────────────────────────────────────────

describe('FormField — label association (3.3.2, 1.3.1)', () => {
  it('associates the label with the input via htmlFor/id', () => {
    render(<FormField label="Email address" />);
    const input = screen.getByRole('textbox', { name: 'Email address' });
    expect(input).toBeInTheDocument();
  });

  it('renders a visible <label> element', () => {
    render(<FormField label="Full name" />);
    expect(screen.getByText('Full name').tagName).toBe('LABEL');
  });

  it('does not use placeholder as the only label', () => {
    render(<FormField label="Email address" placeholder="e.g. user@example.com" />);
    // Accessible name comes from the label, not the placeholder
    expect(screen.getByRole('textbox', { name: 'Email address' })).toBeInTheDocument();
  });
});

// ─── Hint text ────────────────────────────────────────────────────────────────

describe('FormField — hint text', () => {
  it('renders hint text when provided', () => {
    render(<FormField label="Email address" hint="We'll send your statement here" />);
    expect(screen.getByText("We'll send your statement here")).toBeInTheDocument();
  });

  it('links the hint to the input via aria-describedby', () => {
    render(<FormField label="Email address" hint="We'll send your statement here" />);
    const input = screen.getByRole('textbox');
    const hintEl = screen.getByText("We'll send your statement here");
    expect(input.getAttribute('aria-describedby')).toContain(hintEl.id);
  });

  it('does not set aria-describedby when there is no hint and no error', () => {
    render(<FormField label="Email address" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });
});

// ─── Error state ──────────────────────────────────────────────────────────────

describe('FormField — error state (3.3.1, 1.3.1, 1.4.1, 4.1.3)', () => {
  it('sets aria-invalid on the input when errorMessage is provided', () => {
    render(<FormField label="Email address" errorMessage="Enter a valid email." />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when there is no error', () => {
    render(<FormField label="Email address" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
  });

  it('links the error text to the input via aria-describedby', () => {
    render(<FormField label="Email address" errorMessage="Enter a valid email." />);
    const input = screen.getByRole('textbox');
    // Error text appears in both the visible <p> and the live region — target the <p> specifically
    const errorPara = screen
      .getAllByText('Enter a valid email.', { exact: false })
      .find((el) => el.tagName === 'P')!;
    expect(input.getAttribute('aria-describedby')).toContain(errorPara.id);
  });

  it('renders the error message visibly', () => {
    render(<FormField label="Email address" errorMessage="Enter a valid email." />);
    const visibleError = screen
      .getAllByText('Enter a valid email.', { exact: false })
      .find((el) => el.tagName === 'P');
    expect(visibleError).toBeInTheDocument();
  });

  it('includes a non-color error indicator (icon) alongside the error text', () => {
    render(<FormField label="Email address" errorMessage="Enter a valid email." />);
    // The ⚠ icon is aria-hidden but present in the DOM alongside the text
    const errorPara = screen
      .getAllByText('Enter a valid email.', { exact: false })
      .find((el) => el.tagName === 'P')!;
    expect(errorPara.textContent).toContain('⚠');
  });

  it('populates the polite live region with the error message (4.1.3)', () => {
    render(<FormField label="Email address" errorMessage="Enter a valid email." />);
    const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion?.textContent).toContain('Enter a valid email.');
  });

  it('clears the live region when the error is removed', () => {
    const { rerender } = render(
      <FormField label="Email address" errorMessage="Enter a valid email." />
    );
    rerender(<FormField label="Email address" errorMessage="" />);
    const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion?.textContent).toBe('');
  });

  it('links both hint and error to the input when both are present', () => {
    render(
      <FormField
        label="Email address"
        hint="We'll send your statement here"
        errorMessage="Enter a valid email."
      />
    );
    const input = screen.getByRole('textbox');
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    const hintEl = screen.getByText("We'll send your statement here");
    const errorPara = screen
      .getAllByText('Enter a valid email.', { exact: false })
      .find((el) => el.tagName === 'P')!;
    expect(describedBy).toContain(hintEl.id);
    expect(describedBy).toContain(errorPara.id);
  });
});

// ─── Required ─────────────────────────────────────────────────────────────────

describe('FormField — required (3.3.2)', () => {
  it('marks the input as required', () => {
    render(<FormField label="Email address" required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('renders the visual asterisk with aria-hidden so AT uses the native required attribute', () => {
    render(<FormField label="Email address" required />);
    const asterisk = document.querySelector('[aria-hidden="true"]');
    expect(asterisk?.textContent?.trim()).toBe('*');
  });

  it('accessible name does not include the asterisk (AT reads "required" from the input)', () => {
    render(<FormField label="Email address" required />);
    // Accessible name should be just the label text
    expect(screen.getByRole('textbox', { name: 'Email address' })).toBeInTheDocument();
  });
});

// ─── Disabled state ───────────────────────────────────────────────────────────

describe('FormField — disabled state', () => {
  it('disables the input when disabled prop is set', () => {
    render(<FormField label="Email address" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});

// ─── Input type and props passthrough ────────────────────────────────────────

describe('FormField — props passthrough', () => {
  it('passes type to the underlying input', () => {
    render(<FormField label="Password" type="password" />);
    // password inputs have no implicit role — query by label text
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it('passes placeholder to the underlying input', () => {
    render(<FormField label="Email address" placeholder="user@example.com" />);
    expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument();
  });

  it('calls onChange when the user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FormField label="Email address" onChange={onChange} />);
    await user.type(screen.getByRole('textbox'), 'hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onBlur when the input loses focus', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(<FormField label="Email address" onBlur={onBlur} />);
    await user.click(screen.getByRole('textbox'));
    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });
});

// ─── Keyboard interaction ─────────────────────────────────────────────────────

describe('FormField — keyboard interaction', () => {
  it('can be reached by Tab', async () => {
    const user = userEvent.setup();
    render(<FormField label="Email address" />);
    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('accepts typed input', async () => {
    const user = userEvent.setup();
    render(<FormField label="Email address" />);
    await user.click(screen.getByRole('textbox'));
    await user.keyboard('test@example.com');
    expect(screen.getByRole('textbox')).toHaveValue('test@example.com');
  });
});
