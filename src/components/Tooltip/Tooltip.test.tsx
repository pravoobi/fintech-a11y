import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Tooltip } from './Tooltip';

function renderTooltip(props: Partial<React.ComponentProps<typeof Tooltip>> = {}) {
  return render(
    <Tooltip content="Sort code is a 6-digit number identifying your bank branch." {...props}>
      <button type="button">What is a sort code?</button>
    </Tooltip>,
  );
}

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('Tooltip — axe', () => {
  it('has no violations (tooltip hidden)', async () => {
    const { container } = renderTooltip();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations (tooltip visible, trigger focused)', async () => {
    const { container } = renderTooltip();
    fireEvent.focus(screen.getByRole('button'));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with placement="bottom"', async () => {
    const { container } = renderTooltip({ placement: 'bottom' });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a link trigger', async () => {
    const { container } = render(
      <Tooltip content="Opens in a new tab.">
        <a href="#">Annual report</a>
      </Tooltip>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Role and content (4.1.2, 1.3.1) ─────────────────────────────────────────

describe('Tooltip — role and content (4.1.2)', () => {
  it('renders an element with role="tooltip"', () => {
    renderTooltip();
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('tooltip contains the provided content', () => {
    renderTooltip();
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Sort code is a 6-digit number identifying your bank branch.',
    );
  });
});

// ─── aria-describedby linkage (4.1.2) ────────────────────────────────────────

describe('Tooltip — aria-describedby (4.1.2)', () => {
  it('trigger has aria-describedby pointing to the tooltip id', () => {
    renderTooltip();
    const trigger  = screen.getByRole('button');
    const tooltip  = screen.getByRole('tooltip');
    expect(trigger.getAttribute('aria-describedby')).toContain(tooltip.id);
  });

  it('merges with an existing aria-describedby on the trigger', () => {
    render(
      <Tooltip content="Tooltip text.">
        <button type="button" aria-describedby="existing-hint">Trigger</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole('button');
    const describedBy = trigger.getAttribute('aria-describedby') ?? '';
    expect(describedBy).toContain('existing-hint');
    expect(describedBy).toContain(screen.getByRole('tooltip').id);
  });
});

// ─── Focus show / hide (2.1.1, 1.4.13) ───────────────────────────────────────

describe('Tooltip — focus show / hide (2.1.1, 1.4.13)', () => {
  it('becomes visible when the trigger is focused', () => {
    renderTooltip();
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).not.toHaveClass('_visible_');
    fireEvent.focus(screen.getByRole('button'));
    expect(tooltip.className).toMatch(/visible/);
  });

  it('hides when the trigger loses focus', () => {
    renderTooltip();
    fireEvent.focus(screen.getByRole('button'));
    fireEvent.blur(screen.getByRole('button'));
    expect(screen.getByRole('tooltip').className).not.toMatch(/visible/);
  });
});

// ─── Hover show / hide (1.4.13) ───────────────────────────────────────────────

describe('Tooltip — hover show / hide (1.4.13)', () => {
  it('becomes visible on mouseenter', () => {
    renderTooltip();
    fireEvent.mouseEnter(screen.getByRole('button').closest('span')!);
    expect(screen.getByRole('tooltip').className).toMatch(/visible/);
  });

  it('hides after mouseleave with a short delay', async () => {
    vi.useFakeTimers();
    renderTooltip();
    const wrapper = screen.getByRole('button').closest('span')!;
    fireEvent.mouseEnter(wrapper);
    fireEvent.mouseLeave(wrapper);
    // Before the delay the tooltip is still visible
    expect(screen.getByRole('tooltip').className).toMatch(/visible/);
    // After the delay it hides
    await act(async () => { vi.advanceTimersByTime(150); });
    expect(screen.getByRole('tooltip').className).not.toMatch(/visible/);
    vi.useRealTimers();
  });

  it('stays visible when the pointer moves from trigger to tooltip', async () => {
    vi.useFakeTimers();
    renderTooltip();
    const wrapper = screen.getByRole('button').closest('span')!;
    fireEvent.mouseEnter(wrapper);
    fireEvent.mouseLeave(wrapper);
    // Re-enter before the hide delay fires (simulates pointer moving to tooltip)
    fireEvent.mouseEnter(wrapper);
    await act(async () => { vi.advanceTimersByTime(150); });
    expect(screen.getByRole('tooltip').className).toMatch(/visible/);
    vi.useRealTimers();
  });
});

// ─── Escape key (2.1.1, 1.4.13 — Dismissible) ────────────────────────────────

describe('Tooltip — Escape key (2.1.1, 1.4.13)', () => {
  it('hides the tooltip when Escape is pressed', () => {
    renderTooltip();
    const trigger = screen.getByRole('button');
    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip').className).toMatch(/visible/);
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.getByRole('tooltip').className).not.toMatch(/visible/);
  });

  it('keeps focus on the trigger after Escape', () => {
    renderTooltip();
    const trigger = screen.getByRole('button');
    trigger.focus(); // actually moves document.activeElement; fireEvent.focus only dispatches the event
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(trigger).toHaveFocus();
  });

  it('forwards other keydown events to the trigger', () => {
    const onKeyDown = vi.fn();
    render(
      <Tooltip content="Tooltip.">
        <button type="button" onKeyDown={onKeyDown}>Trigger</button>
      </Tooltip>,
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});

// ─── Visibility via CSS class (not display:none) ──────────────────────────────

describe('Tooltip — visibility mechanism', () => {
  it('tooltip is in the DOM when hidden (aria-describedby can resolve)', () => {
    renderTooltip();
    // role="tooltip" should always be queryable — it uses visibility not display:none
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });
});

// ─── Keyboard reach (2.1.1) ───────────────────────────────────────────────────

describe('Tooltip — keyboard reach (2.1.1)', () => {
  it('trigger is reachable by Tab', async () => {
    const user = userEvent.setup();
    renderTooltip();
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });
});
