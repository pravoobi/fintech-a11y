import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import React, { useRef } from 'react';
import { Modal } from './Modal';

// Modal uses createPortal — query document.body for axe and portal content

function BasicModal({
  isOpen = true,
  onClose = vi.fn(),
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm transfer">
      <p>Are you sure you want to proceed?</p>
      <button>Confirm</button>
      <button>Cancel</button>
    </Modal>
  );
}

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('Modal — axe', () => {
  it('has no violations when open', async () => {
    render(<BasicModal />);
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no violations with a description', async () => {
    render(
      <Modal
        isOpen
        onClose={vi.fn()}
        title="Confirm transfer"
        description="This action cannot be undone."
      >
        <button>Confirm</button>
      </Modal>
    );
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

// ─── Role and ARIA attributes (4.1.2) ─────────────────────────────────────────

describe('Modal — role and ARIA attributes (4.1.2)', () => {
  it('renders a dialog role', () => {
    render(<BasicModal />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('sets aria-modal="true"', () => {
    render(<BasicModal />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('links aria-labelledby to the title heading', () => {
    render(<BasicModal />);
    const dialog = screen.getByRole('dialog');
    const title = screen.getByRole('heading', { name: /confirm transfer/i });
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
  });

  it('sets aria-describedby when description is provided', () => {
    render(
      <Modal
        isOpen
        onClose={vi.fn()}
        title="Confirm transfer"
        description="This action cannot be undone."
      >
        <button>OK</button>
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    const desc = screen.getByText('This action cannot be undone.');
    expect(dialog.getAttribute('aria-describedby')).toBe(desc.id);
  });

  it('does not set aria-describedby when no description is provided', () => {
    render(<BasicModal />);
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-describedby');
  });

  it('renders the title as a visible heading', () => {
    render(<BasicModal />);
    expect(screen.getByRole('heading', { name: /confirm transfer/i })).toBeInTheDocument();
  });
});

// ─── Visibility ───────────────────────────────────────────────────────────────

describe('Modal — visibility', () => {
  it('renders nothing when isOpen is false', () => {
    render(<BasicModal isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog when isOpen is true', () => {
    render(<BasicModal isOpen />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

// ─── Focus management (2.4.3) ─────────────────────────────────────────────────

describe('Modal — focus management (2.4.3)', () => {
  it('moves focus into the dialog on open', async () => {
    render(<BasicModal />);
    // useFocusTrap uses requestAnimationFrame — waitFor retries until focus lands
    await waitFor(() => {
      expect(document.activeElement).not.toBe(document.body);
      const dialog = screen.getByRole('dialog');
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it('focuses the initialFocusRef element when provided', async () => {
    function WithInitialFocus() {
      const ref = useRef<HTMLButtonElement>(null);
      return (
        <Modal isOpen onClose={vi.fn()} title="Test" initialFocusRef={ref}>
          <button>First button</button>
          <button ref={ref}>Target button</button>
        </Modal>
      );
    }
    render(<WithInitialFocus />);
    await waitFor(() => {
      expect(screen.getByText('Target button')).toHaveFocus();
    });
  });

  it('returns focus to the triggering element on close', async () => {
    const user = userEvent.setup();

    function WithTrigger() {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Open modal</button>
          <Modal isOpen={open} onClose={() => setOpen(false)} title="Test dialog">
            <button>Inside</button>
          </Modal>
        </>
      );
    }

    render(<WithTrigger />);
    const trigger = screen.getByText('Open modal');
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Close via Escape
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  });
});

// ─── Focus trap (2.1.1, 2.1.2) ───────────────────────────────────────────────

describe('Modal — focus trap (2.1.1, 2.1.2)', () => {
  it('wraps focus from last to first element on Tab', async () => {
    render(<BasicModal />);

    await waitFor(() => {
      expect(document.activeElement).not.toBe(document.body);
    });

    // Find all focusable elements in the dialog and focus the last one
    const dialog = screen.getByRole('dialog');
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const last = focusable[focusable.length - 1];
    act(() => { last.focus(); });

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });

    expect(document.activeElement).toBe(focusable[0]);
  });

  it('wraps focus from first to last element on Shift+Tab', async () => {
    render(<BasicModal />);

    await waitFor(() => {
      expect(document.activeElement).not.toBe(document.body);
    });

    const dialog = screen.getByRole('dialog');
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    act(() => { first.focus(); });

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    expect(document.activeElement).toBe(focusable[focusable.length - 1]);
  });
});

// ─── Close triggers ───────────────────────────────────────────────────────────

describe('Modal — close triggers', () => {
  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<BasicModal onClose={onClose} />);

    await waitFor(() => {
      expect(document.activeElement).not.toBe(document.body);
    });

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<BasicModal onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close dialog/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(<BasicModal onClose={onClose} />);
    // The backdrop is the direct parent of the dialog panel
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog.parentElement!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when the dialog panel itself is clicked', async () => {
    const onClose = vi.fn();
    render(<BasicModal onClose={onClose} />);
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });
});

// ─── Scroll lock ──────────────────────────────────────────────────────────────

describe('Modal — scroll lock', () => {
  it('sets overflow hidden on body while open', () => {
    render(<BasicModal isOpen />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when closed', () => {
    const { rerender } = render(<BasicModal isOpen />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<BasicModal isOpen={false} />);
    expect(document.body.style.overflow).toBe('');
  });
});

// ─── Close button accessibility ───────────────────────────────────────────────

describe('Modal — close button (4.1.2, 2.5.8)', () => {
  it('has an accessible name on the close button', () => {
    render(<BasicModal />);
    expect(screen.getByRole('button', { name: /close dialog/i })).toBeInTheDocument();
  });
});
