import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Alert } from './Alert';
import type { AlertVariant } from './Alert';

const VARIANTS: AlertVariant[] = ['info', 'success', 'warning', 'error'];

const VARIANT_ROLES: Record<AlertVariant, 'alert' | 'status'> = {
  error:   'alert',
  warning: 'alert',
  info:    'status',
  success: 'status',
};

function renderAlert(props: Partial<React.ComponentProps<typeof Alert>> = {}) {
  return render(
    <Alert variant="info" {...props}>
      Your session will expire in 5 minutes.
    </Alert>,
  );
}

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('Alert — axe', () => {
  it.each(VARIANTS)('has no violations for variant "%s"', async (variant) => {
    const { container } = renderAlert({ variant });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a title', async () => {
    const { container } = renderAlert({ title: 'Session expiring' });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a dismiss button', async () => {
    const { container } = renderAlert({ onDismiss: vi.fn() });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations for error variant with title and dismiss', async () => {
    const { container } = renderAlert({
      variant: 'error',
      title: 'Payment failed',
      onDismiss: vi.fn(),
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Role (4.1.3) ─────────────────────────────────────────────────────────────

describe('Alert — role (4.1.3)', () => {
  it('uses role="alert" for error variant', () => {
    renderAlert({ variant: 'error' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="alert" for warning variant', () => {
    renderAlert({ variant: 'warning' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('uses role="status" for info variant', () => {
    renderAlert({ variant: 'info' });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses role="status" for success variant', () => {
    renderAlert({ variant: 'success' });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

// ─── Color not sole indicator (1.4.1) ────────────────────────────────────────

describe('Alert — color not sole indicator (1.4.1)', () => {
  it.each(VARIANTS)('renders an icon for variant "%s"', (variant) => {
    renderAlert({ variant });
    const icons: Record<AlertVariant, string> = {
      info:    'ℹ',
      success: '✓',
      warning: '⚠',
      error:   '✕',
    };
    const alert = screen.getByRole(VARIANT_ROLES[variant]);
    expect(alert.textContent).toContain(icons[variant]);
  });

  it.each(VARIANTS)('renders a visually-hidden severity label for variant "%s"', (variant) => {
    renderAlert({ variant });
    const labels: Record<AlertVariant, string> = {
      info:    'Information:',
      success: 'Success:',
      warning: 'Warning:',
      error:   'Error:',
    };
    expect(screen.getByText(labels[variant])).toBeInTheDocument();
  });
});

// ─── Title (1.3.1, 4.1.2) ────────────────────────────────────────────────────

describe('Alert — title', () => {
  it('renders the title when provided', () => {
    renderAlert({ title: 'Session expiring' });
    expect(screen.getByText('Session expiring')).toBeInTheDocument();
  });

  it('sets aria-labelledby pointing to the title element', () => {
    renderAlert({ title: 'Session expiring' });
    const alert = screen.getByRole('status');
    const titleEl = screen.getByText('Session expiring');
    expect(alert.getAttribute('aria-labelledby')).toBe(titleEl.id);
  });

  it('does not set aria-labelledby when title is absent', () => {
    renderAlert();
    const alert = screen.getByRole('status');
    expect(alert).not.toHaveAttribute('aria-labelledby');
  });
});

// ─── Children ────────────────────────────────────────────────────────────────

describe('Alert — children', () => {
  it('renders the message content', () => {
    renderAlert();
    expect(screen.getByText('Your session will expire in 5 minutes.')).toBeInTheDocument();
  });
});

// ─── Dismiss button (2.5.8, 4.1.2) ───────────────────────────────────────────

describe('Alert — dismiss button (2.5.8, 4.1.2)', () => {
  it('renders a dismiss button when onDismiss is provided', () => {
    renderAlert({ onDismiss: vi.fn() });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not render a dismiss button when onDismiss is absent', () => {
    renderAlert();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('dismiss button has a descriptive aria-label for info variant', () => {
    renderAlert({ variant: 'info', onDismiss: vi.fn() });
    expect(screen.getByRole('button')).toHaveAccessibleName('Dismiss info alert');
  });

  it('dismiss button has a descriptive aria-label for error variant', () => {
    renderAlert({ variant: 'error', onDismiss: vi.fn() });
    expect(screen.getByRole('button')).toHaveAccessibleName('Dismiss error alert');
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    renderAlert({ onDismiss });
    fireEvent.click(screen.getByRole('button'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

// ─── Keyboard operability (2.1.1) ─────────────────────────────────────────────

describe('Alert — keyboard operability (2.1.1)', () => {
  it('dismiss button is reachable by Tab', async () => {
    const user = userEvent.setup();
    renderAlert({ onDismiss: vi.fn() });
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('dismiss button fires onDismiss on Enter', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderAlert({ onDismiss });
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('dismiss button fires onDismiss on Space', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    renderAlert({ onDismiss });
    await user.tab();
    await user.keyboard(' ');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
