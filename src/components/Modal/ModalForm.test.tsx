import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, it, expect, vi } from 'vitest';
import { ModalForm } from './ModalForm';
import type { ModalFormField } from './ModalForm';

// Helper: submit the form directly via fireEvent to avoid rAF/focus-trap timing
// interference that occurs when clicking the submit button with userEvent.
function submitForm() {
  fireEvent.submit(screen.getByRole('form'));
}

// ─── Shared test data ─────────────────────────────────────────────────────────

const FIELDS: ModalFormField[] = [
  {
    name: 'recipient',
    label: 'Recipient name',
    required: true,
    autoComplete: 'name',
  },
  {
    name: 'accountNumber',
    label: 'Account number',
    required: true,
    inputMode: 'numeric',
    hint: '8-digit number shown on your bank statement',
    validate: (v) =>
      v.trim() && !/^\d{8}$/.test(v.trim())
        ? 'Account number must be exactly 8 digits.'
        : '',
  },
  {
    name: 'amount',
    label: 'Amount',
    required: true,
    inputMode: 'decimal',
    hint: 'GBP — e.g. 100.00',
    validate: (v) => {
      if (!v.trim()) return '';
      if (!/^\d+(\.\d{1,2})?$/.test(v.trim())) return 'Enter a valid amount (e.g. 100.00).';
      if (parseFloat(v) <= 0) return 'Amount must be greater than zero.';
      return '';
    },
  },
  {
    name: 'reference',
    label: 'Reference',
    hint: 'Optional — max 18 characters',
    maxLength: 18,
  },
];

function renderForm(overrides: Partial<React.ComponentProps<typeof ModalForm>> = {}) {
  const defaults = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Send payment',
    fields: FIELDS,
    onSubmit: vi.fn(),
  };
  return render(<ModalForm {...defaults} {...overrides} />);
}

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('ModalForm — axe', () => {
  it('has no violations in initial state', async () => {
    renderForm();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no violations when error summary is visible', async () => {
    renderForm();
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/there are \d+ errors in this form/i)).toBeInTheDocument();
    });
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no violations when inline errors are shown after blur', async () => {
    const user = userEvent.setup();
    renderForm();
    const recipientInput = screen.getByLabelText(/recipient name/i);
    await user.click(recipientInput);
    await user.tab(); // blur without entering a value
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

// ─── Roles and structure (4.1.2, 1.3.1) ──────────────────────────────────────

describe('ModalForm — roles and structure', () => {
  it('renders a dialog with the given title', () => {
    renderForm();
    expect(screen.getByRole('dialog', { name: /send payment/i })).toBeInTheDocument();
  });

  it('renders a form with an accessible name', () => {
    renderForm();
    expect(screen.getByRole('form', { name: /send payment/i })).toBeInTheDocument();
  });

  it('renders a label for every field', () => {
    renderForm();
    FIELDS.forEach((f) => {
      expect(screen.getByLabelText(new RegExp(f.label, 'i'))).toBeInTheDocument();
    });
  });

  it('renders required fields with aria-required="true"', () => {
    renderForm();
    const required = FIELDS.filter((f) => f.required);
    required.forEach((f) => {
      expect(screen.getByLabelText(new RegExp(f.label, 'i'))).toHaveAttribute(
        'aria-required',
        'true',
      );
    });
  });

  it('does not set aria-required on optional fields', () => {
    renderForm();
    const optional = FIELDS.filter((f) => !f.required);
    optional.forEach((f) => {
      expect(screen.getByLabelText(new RegExp(f.label, 'i'))).not.toHaveAttribute('aria-required');
    });
  });
});

// ─── Initial focus (2.4.3) ────────────────────────────────────────────────────

describe('ModalForm — initial focus', () => {
  it('moves focus to the first field on open', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByLabelText(/recipient name/i)).toHaveFocus();
    });
  });
});

// ─── Inline validation on blur (3.3.1) ───────────────────────────────────────

describe('ModalForm — inline validation on blur', () => {
  it('sets aria-invalid on a required field blurred with no value', () => {
    renderForm();
    const input = screen.getByLabelText(/recipient name/i);
    // Use fireEvent.blur to avoid rAF/focus-trap timing interference from user.tab()
    fireEvent.blur(input);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid before the field is touched', () => {
    renderForm();
    const input = screen.getByLabelText(/recipient name/i);
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('links aria-describedby to the error element when invalid', () => {
    renderForm();
    const input = screen.getByLabelText(/recipient name/i);
    fireEvent.blur(input);

    const describedBy = input.getAttribute('aria-describedby') ?? '';
    const errorEl = document.getElementById(describedBy);
    expect(errorEl).not.toBeNull();
    expect(errorEl?.textContent).toMatch(/required/i);
  });

  it('includes hint ID in aria-describedby when hint is present', () => {
    renderForm();
    // Account number field has a hint — check describedBy includes the hint element
    const input = screen.getByLabelText(/account number/i);
    const describedBy = input.getAttribute('aria-describedby') ?? '';
    const ids = describedBy.split(' ').filter(Boolean);
    const hintEl = ids.map((id) => document.getElementById(id)).find((el) => el?.textContent?.includes('bank statement'));
    expect(hintEl).not.toBeNull();
  });

  it('clears aria-invalid when a valid value is entered and blurred', () => {
    renderForm();
    const input = screen.getByLabelText(/recipient name/i);

    // Blur empty → error
    fireEvent.blur(input);
    expect(input).toHaveAttribute('aria-invalid', 'true');

    // Type a valid value then blur → error clears
    fireEvent.change(input, { target: { value: 'Alice Johnson' } });
    fireEvent.blur(input);
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('shows custom validation error for invalid account number', () => {
    renderForm();
    const input = screen.getByLabelText(/account number/i);
    fireEvent.change(input, { target: { value: '12345' } }); // too short
    fireEvent.blur(input);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/must be exactly 8 digits/i)).toBeInTheDocument();
  });
});

// ─── Error summary on submit (3.3.1, 4.1.3) ──────────────────────────────────

describe('ModalForm — error summary on submit', () => {
  it('shows error summary when required fields are empty', async () => {
    renderForm();
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/there are \d+ errors in this form/i)).toBeInTheDocument();
    });
  });

  it('error summary lists each validation error', async () => {
    renderForm();
    submitForm();
    await waitFor(() => {
      const list = screen.getByRole('list', { name: /form errors/i });
      expect(within(list).getByText('Recipient name is required.')).toBeInTheDocument();
      expect(within(list).getByText('Account number is required.')).toBeInTheDocument();
      expect(within(list).getByText('Amount is required.')).toBeInTheDocument();
    });
  });

  it('error summary heading receives focus on submit failure', async () => {
    renderForm();
    submitForm();
    await waitFor(() => {
      const heading = screen.getByText(/there are \d+ errors in this form/i);
      expect(heading).toHaveFocus();
    });
  });

  it('error summary heading has tabIndex=-1 (programmatic focus only)', async () => {
    renderForm();
    submitForm();
    await waitFor(() => {
      const heading = screen.getByText(/there are \d+ errors in this form/i);
      expect(heading).toHaveAttribute('tabindex', '-1');
    });
  });

  it('all fields have aria-invalid after a failed submit attempt', async () => {
    renderForm();
    submitForm();
    await waitFor(() => {
      const requiredFields = FIELDS.filter((f) => f.required);
      requiredFields.forEach((f) => {
        const input = screen.getByLabelText(new RegExp(f.label, 'i'));
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  it('error summary disappears when a corrected form is submitted successfully', async () => {
    const onSubmit = vi.fn();
    renderForm({ onSubmit });

    // Trigger error summary — just wait for it to appear (focus is tested separately)
    submitForm();
    await waitFor(() => {
      expect(screen.getByText(/there are \d+ errors in this form/i)).toBeInTheDocument();
    });

    // Fill valid values — fireEvent.change avoids rAF focus interference
    fireEvent.change(screen.getByLabelText(/recipient name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/account number/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100.00' } });
    submitForm();

    await waitFor(() => {
      expect(screen.queryByText(/there are/i)).not.toBeInTheDocument();
    });
  });
});

// ─── Successful submission ─────────────────────────────────────────────────────

describe('ModalForm — successful submission', () => {
  it('calls onSubmit with field data when all valid', async () => {
    const onSubmit = vi.fn();
    renderForm({ onSubmit });

    fireEvent.change(screen.getByLabelText(/recipient name/i), { target: { value: 'Alice Johnson' } });
    fireEvent.change(screen.getByLabelText(/account number/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '250.00' } });
    submitForm();

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: 'Alice Johnson',
          accountNumber: '12345678',
          amount: '250.00',
        }),
      );
    });
  });

  it('calls onClose after a successful submit', async () => {
    const onClose = vi.fn();
    renderForm({ onClose });

    fireEvent.change(screen.getByLabelText(/recipient name/i), { target: { value: 'Alice Johnson' } });
    fireEvent.change(screen.getByLabelText(/account number/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '250.00' } });
    submitForm();

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  it('disables the submit button while submitting', async () => {
    let resolve!: () => void;
    const onSubmit = vi.fn(
      () => new Promise<void>((r) => { resolve = r; }),
    );
    renderForm({ onSubmit });

    fireEvent.change(screen.getByLabelText(/recipient name/i), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText(/account number/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '100' } });
    submitForm();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
    });

    // Resolve and let it finish
    resolve();
  });
});

// ─── Cancel / close ───────────────────────────────────────────────────────────

describe('ModalForm — cancel', () => {
  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderForm({ onClose });
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('resets form state when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = renderForm({ onClose });

    await user.type(screen.getByLabelText(/recipient name/i), 'Alice');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Re-open by setting isOpen back to true
    rerender(
      <ModalForm
        isOpen
        onClose={onClose}
        title="Send payment"
        fields={FIELDS}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/recipient name/i)).toHaveValue('');
  });
});

// ─── Live region (4.1.3) ──────────────────────────────────────────────────────

describe('ModalForm — live region', () => {
  it('inline error paragraphs have aria-live="polite"', () => {
    renderForm();
    // Error containers are always present (empty when no error)
    const form = screen.getByRole('form');
    const liveRegions = form.querySelectorAll('[aria-live="polite"]');
    expect(liveRegions.length).toBeGreaterThanOrEqual(FIELDS.length);
  });
});
