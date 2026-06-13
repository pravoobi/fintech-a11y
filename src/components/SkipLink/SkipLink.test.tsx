import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { SkipLink } from './SkipLink';

function renderSkipLink(props: Partial<React.ComponentProps<typeof SkipLink>> = {}) {
  return render(
    <>
      <SkipLink {...props} />
      <main id={props.targetId ?? 'main-content'} tabIndex={-1}>
        <p>Main content</p>
      </main>
    </>,
  );
}

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('SkipLink — axe', () => {
  it('has no violations in default state', async () => {
    const { container } = renderSkipLink();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a custom label', async () => {
    const { container } = renderSkipLink({ label: 'Skip to account summary' });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a custom targetId', async () => {
    const { container } = renderSkipLink({ targetId: 'account-summary' });
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Rendered output ──────────────────────────────────────────────────────────

describe('SkipLink — rendered output', () => {
  it('renders an anchor element', () => {
    renderSkipLink();
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('uses the default label "Skip to main content"', () => {
    renderSkipLink();
    expect(screen.getByRole('link')).toHaveAccessibleName('Skip to main content');
  });

  it('uses a custom label when provided', () => {
    renderSkipLink({ label: 'Skip to account summary' });
    expect(screen.getByRole('link')).toHaveAccessibleName('Skip to account summary');
  });

  it('href points to the default target id', () => {
    renderSkipLink();
    expect(screen.getByRole('link')).toHaveAttribute('href', '#main-content');
  });

  it('href points to a custom targetId', () => {
    renderSkipLink({ targetId: 'account-summary' });
    expect(screen.getByRole('link')).toHaveAttribute('href', '#account-summary');
  });
});

// ─── Focusability (2.4.1) ─────────────────────────────────────────────────────

describe('SkipLink — focusability (2.4.1)', () => {
  it('link is in the DOM — not display:none (must be focusable)', () => {
    renderSkipLink();
    // getByRole would throw if the element were display:none
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('link is the first focusable element on Tab', async () => {
    const user = userEvent.setup();
    renderSkipLink();
    await user.tab();
    expect(screen.getByRole('link')).toHaveFocus();
  });

  // Note: anchor navigation (href="#id" → focus moves to target) is browser-level
  // behaviour that jsdom does not implement. Verified manually — see README.
});

// ─── Target element ───────────────────────────────────────────────────────────

describe('SkipLink — target element', () => {
  it('target has tabIndex=-1 to accept programmatic focus', () => {
    renderSkipLink();
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });
});
