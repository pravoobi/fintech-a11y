import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '../../hooks/useToast';
import { ToastRegion } from './Toast';

// ─── Test helpers ─────────────────────────────────────────────────────────────

function TestApp({ onReady }: { onReady?: (toast: ReturnType<typeof useToast>['toast']) => void }) {
  const { toast } = useToast();
  return (
    <button
      onClick={() => onReady?.(toast)}
      data-testid="trigger"
    >
      trigger
    </button>
  );
}

function renderToasts() {
  let toastFn: ReturnType<typeof useToast>['toast'];

  render(
    <ToastProvider>
      <TestApp onReady={(fn) => { toastFn = fn; }} />
      <ToastRegion />
    </ToastProvider>
  );

  // Fire the trigger once to capture the toast function
  fireEvent.click(screen.getByTestId('trigger'));

  return {
    toast: (opts: Parameters<typeof toastFn>[0]) => {
      act(() => { toastFn(opts); });
    },
  };
}

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('Toast — axe', () => {
  it('has no violations with an info toast', async () => {
    const { toast } = renderToasts();
    toast({ message: 'Your session will expire in 5 minutes.', severity: 'info', duration: 0 });
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no violations with a success toast', async () => {
    const { toast } = renderToasts();
    toast({ message: 'Transfer complete.', severity: 'success', duration: 0 });
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no violations with a warning toast', async () => {
    const { toast } = renderToasts();
    toast({ message: 'Your password expires soon.', severity: 'warning', duration: 0 });
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no violations with an error toast', async () => {
    const { toast } = renderToasts();
    toast({ message: 'Transfer failed. Please try again.', severity: 'error', duration: 0 });
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

// ─── Live region roles (4.1.3) ────────────────────────────────────────────────

describe('Toast — live region roles (4.1.3)', () => {
  it('uses role="status" and aria-live="polite" for info', () => {
    const { toast } = renderToasts();
    toast({ message: 'Info message', severity: 'info', duration: 0 });
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('uses role="status" and aria-live="polite" for success', () => {
    const { toast } = renderToasts();
    toast({ message: 'Success message', severity: 'success', duration: 0 });
    const el = screen.getByRole('status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });

  it('uses role="alert" and aria-live="assertive" for warning', () => {
    const { toast } = renderToasts();
    toast({ message: 'Warning message', severity: 'warning', duration: 0 });
    const el = screen.getByRole('alert');
    expect(el).toHaveAttribute('aria-live', 'assertive');
  });

  it('uses role="alert" and aria-live="assertive" for error', () => {
    const { toast } = renderToasts();
    toast({ message: 'Error message', severity: 'error', duration: 0 });
    const el = screen.getByRole('alert');
    expect(el).toHaveAttribute('aria-live', 'assertive');
  });

  it('sets aria-atomic="true" on every toast', () => {
    const { toast } = renderToasts();
    toast({ message: 'Any message', severity: 'success', duration: 0 });
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true');
  });
});

// ─── Severity label (1.4.1) ───────────────────────────────────────────────────

describe('Toast — severity label (1.4.1)', () => {
  it('includes a visually-hidden "Success:" prefix for success toasts', () => {
    const { toast } = renderToasts();
    toast({ message: 'Transfer complete.', severity: 'success', duration: 0 });
    expect(screen.getByText(/success:/i)).toBeInTheDocument();
  });

  it('includes a visually-hidden "Error:" prefix for error toasts', () => {
    const { toast } = renderToasts();
    toast({ message: 'Something went wrong.', severity: 'error', duration: 0 });
    expect(screen.getByText(/error:/i)).toBeInTheDocument();
  });

  it('includes a visually-hidden "Warning:" prefix for warning toasts', () => {
    const { toast } = renderToasts();
    toast({ message: 'Password expires soon.', severity: 'warning', duration: 0 });
    expect(screen.getByText(/warning:/i)).toBeInTheDocument();
  });

  it('includes a visually-hidden "Information:" prefix for info toasts', () => {
    const { toast } = renderToasts();
    toast({ message: 'Session will expire soon.', severity: 'info', duration: 0 });
    expect(screen.getByText(/information:/i)).toBeInTheDocument();
  });
});

// ─── Dismiss button (4.1.2, 2.5.8) ───────────────────────────────────────────

describe('Toast — dismiss button (4.1.2)', () => {
  it('renders a dismiss button with an accessible name', () => {
    const { toast } = renderToasts();
    toast({ message: 'Transfer complete.', severity: 'success', duration: 0 });
    expect(screen.getByRole('button', { name: /dismiss notification/i })).toBeInTheDocument();
  });

  it('removes the toast when the dismiss button is clicked', () => {
    const { toast } = renderToasts();
    toast({ message: 'Transfer complete.', severity: 'success', duration: 0 });
    fireEvent.click(screen.getByRole('button', { name: /dismiss notification/i }));
    expect(screen.queryByText('Transfer complete.')).not.toBeInTheDocument();
  });
});

// ─── Auto-dismiss (2.2.1) ─────────────────────────────────────────────────────

describe('Toast — auto-dismiss (2.2.1)', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('removes the toast after the duration elapses', () => {
    const { toast } = renderToasts();
    toast({ message: 'Saved.', severity: 'success', duration: 3000 });
    expect(screen.getByText('Saved.')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(3001); });
    expect(screen.queryByText('Saved.')).not.toBeInTheDocument();
  });

  it('does not auto-dismiss when duration is 0', () => {
    const { toast } = renderToasts();
    toast({ message: 'Persistent toast.', severity: 'info', duration: 0 });
    act(() => { vi.advanceTimersByTime(30_000); });
    expect(screen.getByText('Persistent toast.')).toBeInTheDocument();
  });

  it('pauses the timer on mouseenter and resumes on mouseleave', () => {
    const { toast } = renderToasts();
    toast({ message: 'Hover test.', severity: 'info', duration: 3000 });

    const toastEl = screen.getByRole('status');

    // Advance 1 s then hover — 2 s remain
    act(() => { vi.advanceTimersByTime(1000); });
    fireEvent.mouseEnter(toastEl);

    // Advance well past the original duration — toast should still be there
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText('Hover test.')).toBeInTheDocument();

    // Resume — remaining ~2 s should now tick down
    fireEvent.mouseLeave(toastEl);
    act(() => { vi.advanceTimersByTime(2001); });
    expect(screen.queryByText('Hover test.')).not.toBeInTheDocument();
  });

  it('pauses the timer on focusin and resumes on focusout', () => {
    const { toast } = renderToasts();
    toast({ message: 'Focus test.', severity: 'info', duration: 2000 });

    const toastEl = screen.getByRole('status');

    act(() => { vi.advanceTimersByTime(500); });
    fireEvent.focusIn(toastEl);

    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText('Focus test.')).toBeInTheDocument();

    fireEvent.focusOut(toastEl);
    act(() => { vi.advanceTimersByTime(1600); });
    expect(screen.queryByText('Focus test.')).not.toBeInTheDocument();
  });
});

// ─── Multiple toasts ──────────────────────────────────────────────────────────

describe('Toast — multiple toasts', () => {
  it('renders multiple toasts simultaneously', () => {
    const { toast } = renderToasts();
    toast({ message: 'First toast.', severity: 'info', duration: 0 });
    toast({ message: 'Second toast.', severity: 'success', duration: 0 });
    toast({ message: 'Third toast.', severity: 'error', duration: 0 });
    expect(screen.getByText('First toast.')).toBeInTheDocument();
    expect(screen.getByText('Second toast.')).toBeInTheDocument();
    expect(screen.getByText('Third toast.')).toBeInTheDocument();
  });

  it('dismissing one toast does not affect others', () => {
    const { toast } = renderToasts();
    toast({ message: 'Keep me.', severity: 'info', duration: 0 });
    toast({ message: 'Dismiss me.', severity: 'error', duration: 0 });

    const dismissButtons = screen.getAllByRole('button', { name: /dismiss notification/i });
    fireEvent.click(dismissButtons[1]);

    expect(screen.getByText('Keep me.')).toBeInTheDocument();
    expect(screen.queryByText('Dismiss me.')).not.toBeInTheDocument();
  });
});

// ─── useToast error boundary ──────────────────────────────────────────────────

describe('useToast — error boundary', () => {
  it('throws when used outside ToastProvider', () => {
    // Suppress the React error overlay in tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function BadComponent() {
      useToast();
      return null;
    }

    expect(() => render(<BadComponent />)).toThrow(
      'useToast must be used within a <ToastProvider>'
    );

    consoleSpy.mockRestore();
  });
});
