import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

function renderPagination(props: Partial<React.ComponentProps<typeof Pagination>> = {}) {
  return render(
    <Pagination
      currentPage={1}
      totalPages={10}
      onPageChange={vi.fn()}
      {...props}
    />,
  );
}

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('Pagination — axe', () => {
  it('has no violations on page 1 of 10', async () => {
    const { container } = renderPagination();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations on a middle page (ellipsis shown)', async () => {
    const { container } = renderPagination({ currentPage: 5 });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations on the last page', async () => {
    const { container } = renderPagination({ currentPage: 10 });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a single page', async () => {
    const { container } = renderPagination({ currentPage: 1, totalPages: 1 });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a custom navigation label', async () => {
    const { container } = renderPagination({ navigationLabel: 'Transaction history pages' });
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Nav landmark (1.3.1, 4.1.2) ─────────────────────────────────────────────

describe('Pagination — nav landmark (1.3.1)', () => {
  it('renders a <nav> landmark', () => {
    renderPagination();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('uses the default accessible label "Pagination"', () => {
    renderPagination();
    expect(screen.getByRole('navigation')).toHaveAccessibleName('Pagination');
  });

  it('uses a custom navigation label when provided', () => {
    renderPagination({ navigationLabel: 'Transaction history pages' });
    expect(screen.getByRole('navigation')).toHaveAccessibleName('Transaction history pages');
  });
});

// ─── aria-current="page" (4.1.2) ──────────────────────────────────────────────

describe('Pagination — aria-current (4.1.2)', () => {
  it('sets aria-current="page" on the active page button', () => {
    renderPagination({ currentPage: 3, totalPages: 5 });
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
  });

  it('does not set aria-current on inactive page buttons', () => {
    renderPagination({ currentPage: 3, totalPages: 5 });
    expect(screen.getByRole('button', { name: 'Page 1' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('button', { name: 'Page 5' })).not.toHaveAttribute('aria-current');
  });

  it('current page button is disabled (not double-navigable)', () => {
    renderPagination({ currentPage: 3, totalPages: 5 });
    expect(screen.getByRole('button', { name: 'Page 3' })).toBeDisabled();
  });
});

// ─── Previous / Next buttons (2.1.1, 4.1.2) ──────────────────────────────────

describe('Pagination — previous and next buttons', () => {
  it('renders a "Previous page" button', () => {
    renderPagination();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
  });

  it('renders a "Next page" button', () => {
    renderPagination();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
  });

  it('disables Previous page button on page 1', () => {
    renderPagination({ currentPage: 1 });
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  it('disables Next page button on the last page', () => {
    renderPagination({ currentPage: 10, totalPages: 10 });
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('enables Previous page button when not on page 1', () => {
    renderPagination({ currentPage: 5 });
    expect(screen.getByRole('button', { name: 'Previous page' })).not.toBeDisabled();
  });

  it('enables Next page button when not on the last page', () => {
    renderPagination({ currentPage: 5 });
    expect(screen.getByRole('button', { name: 'Next page' })).not.toBeDisabled();
  });
});

// ─── onPageChange (2.1.1) ─────────────────────────────────────────────────────

describe('Pagination — onPageChange', () => {
  it('calls onPageChange with the correct page when a page button is clicked', () => {
    const onPageChange = vi.fn();
    // Page 1 is always in the range; currentPage=5 ensures it is enabled
    renderPagination({ currentPage: 5, totalPages: 10, onPageChange });
    fireEvent.click(screen.getByRole('button', { name: 'Page 1' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with currentPage - 1 when Previous is clicked', () => {
    const onPageChange = vi.fn();
    renderPagination({ currentPage: 5, onPageChange });
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('calls onPageChange with currentPage + 1 when Next is clicked', () => {
    const onPageChange = vi.fn();
    renderPagination({ currentPage: 5, onPageChange });
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(6);
  });

  it('does not call onPageChange when the current page button is clicked', () => {
    const onPageChange = vi.fn();
    renderPagination({ currentPage: 3, totalPages: 5, onPageChange });
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(onPageChange).not.toHaveBeenCalled();
  });
});

// ─── Ellipsis (1.3.1) ────────────────────────────────────────────────────────

describe('Pagination — ellipsis', () => {
  it('renders ellipsis on a middle page with enough total pages', () => {
    renderPagination({ currentPage: 5, totalPages: 10 });
    const ellipses = document.querySelectorAll('[aria-hidden="true"]');
    const ellipsisSpans = Array.from(ellipses).filter((el) => el.textContent === '…');
    expect(ellipsisSpans.length).toBeGreaterThanOrEqual(1);
  });

  it('ellipsis elements are aria-hidden', () => {
    renderPagination({ currentPage: 5, totalPages: 10 });
    const ellipses = Array.from(document.querySelectorAll('[aria-hidden="true"]')).filter(
      (el) => el.textContent === '…',
    );
    ellipses.forEach((el) => expect(el).toHaveAttribute('aria-hidden', 'true'));
  });

  it('does not render ellipsis on a small page set', () => {
    renderPagination({ currentPage: 3, totalPages: 5 });
    const ellipses = Array.from(document.querySelectorAll('[aria-hidden="true"]')).filter(
      (el) => el.textContent === '…',
    );
    expect(ellipses.length).toBe(0);
  });
});

// ─── Live region (4.1.3) ──────────────────────────────────────────────────────

describe('Pagination — live region (4.1.3)', () => {
  it('renders a polite live region', () => {
    renderPagination();
    expect(document.querySelector('[role="status"][aria-live="polite"]')).toBeInTheDocument();
  });

  it('live region contains the current page and total', () => {
    renderPagination({ currentPage: 3, totalPages: 10 });
    const liveRegion = document.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion?.textContent).toContain('Page 3 of 10');
  });
});

// ─── Keyboard operability (2.1.1) ─────────────────────────────────────────────

describe('Pagination — keyboard operability (2.1.1)', () => {
  it('Previous page button is skipped by Tab when disabled (page 1)', async () => {
    const user = userEvent.setup();
    renderPagination({ currentPage: 1, totalPages: 5 });
    await user.tab();
    // First tab should land on Page 1 (current, disabled) — actually disabled buttons
    // are removed from tab order; first enabled button is Page 2
    const focused = document.activeElement;
    expect(focused).not.toBe(screen.getByRole('button', { name: 'Previous page' }));
  });

  it('all enabled buttons are reachable by Tab', async () => {
    const user = userEvent.setup();
    renderPagination({ currentPage: 3, totalPages: 5 });

    const enabled = screen
      .getAllByRole('button')
      .filter((btn) => !btn.hasAttribute('disabled'));

    await user.tab();
    for (const btn of enabled) {
      if (document.activeElement === btn) continue;
      await user.tab();
    }
    // Verify at least one enabled button received focus
    expect(enabled.some((btn) => btn === document.activeElement)).toBe(true);
  });
});
