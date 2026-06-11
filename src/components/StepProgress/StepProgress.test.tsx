import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { StepProgress } from './StepProgress';

const STEPS = [
  { label: 'Personal details' },
  { label: 'Identity verification' },
  { label: 'Account funding' },
  { label: 'Review & submit' },
];

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('StepProgress — axe', () => {
  it('has no violations on step 1', async () => {
    const { container } = render(
      <StepProgress steps={STEPS} currentStep={1} ariaLabel="Account setup progress" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations on a middle step', async () => {
    const { container } = render(
      <StepProgress steps={STEPS} currentStep={2} ariaLabel="Account setup progress" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations on the last step', async () => {
    const { container } = render(
      <StepProgress steps={STEPS} currentStep={4} ariaLabel="Account setup progress" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Nav landmark ─────────────────────────────────────────────────────────────

describe('StepProgress — nav landmark (1.3.1, 4.1.2)', () => {
  it('renders a <nav> landmark with the provided aria-label', () => {
    render(
      <StepProgress steps={STEPS} currentStep={2} ariaLabel="Account setup progress" />
    );
    expect(screen.getByRole('navigation', { name: /account setup progress/i })).toBeInTheDocument();
  });

  it('renders a visually-hidden overall position summary linked via aria-describedby', () => {
    render(
      <StepProgress steps={STEPS} currentStep={2} ariaLabel="Account setup progress" />
    );
    const nav = screen.getByRole('navigation');
    const descId = nav.getAttribute('aria-describedby');
    expect(descId).toBeTruthy();
    const descEl = document.getElementById(descId!);
    expect(descEl?.textContent).toMatch(/step 2 of 4/i);
  });
});

// ─── aria-current ─────────────────────────────────────────────────────────────

describe('StepProgress — aria-current (1.3.1, 4.1.2)', () => {
  it('sets aria-current="step" on the current step item', () => {
    render(
      <StepProgress steps={STEPS} currentStep={2} ariaLabel="Account setup progress" />
    );
    const items = screen.getAllByRole('listitem');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
  });

  it('does not set aria-current on completed steps', () => {
    render(
      <StepProgress steps={STEPS} currentStep={3} ariaLabel="Account setup progress" />
    );
    const items = screen.getAllByRole('listitem');
    expect(items[0]).not.toHaveAttribute('aria-current');
    expect(items[1]).not.toHaveAttribute('aria-current');
  });

  it('does not set aria-current on upcoming steps', () => {
    render(
      <StepProgress steps={STEPS} currentStep={2} ariaLabel="Account setup progress" />
    );
    const items = screen.getAllByRole('listitem');
    expect(items[2]).not.toHaveAttribute('aria-current');
    expect(items[3]).not.toHaveAttribute('aria-current');
  });

  it('moves aria-current when currentStep prop changes', () => {
    const { rerender } = render(
      <StepProgress steps={STEPS} currentStep={1} ariaLabel="Account setup progress" />
    );
    let items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('aria-current', 'step');

    rerender(
      <StepProgress steps={STEPS} currentStep={3} ariaLabel="Account setup progress" />
    );
    items = screen.getAllByRole('listitem');
    expect(items[0]).not.toHaveAttribute('aria-current');
    expect(items[2]).toHaveAttribute('aria-current', 'step');
  });
});

// ─── Screen-reader text ───────────────────────────────────────────────────────

describe('StepProgress — AT announcements (1.3.1, 4.1.3)', () => {
  it('announces completed steps with "completed" in the sr-only text', () => {
    render(
      <StepProgress steps={STEPS} currentStep={3} ariaLabel="Account setup progress" />
    );
    // Steps 1 and 2 are completed
    expect(
      screen.getByText(/step 1 of 4.*personal details.*completed/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/step 2 of 4.*identity verification.*completed/i)
    ).toBeInTheDocument();
  });

  it('announces the current step with "current" in the sr-only text', () => {
    render(
      <StepProgress steps={STEPS} currentStep={3} ariaLabel="Account setup progress" />
    );
    expect(
      screen.getByText(/step 3 of 4.*account funding.*current/i)
    ).toBeInTheDocument();
  });

  it('announces upcoming steps without a status suffix', () => {
    render(
      <StepProgress steps={STEPS} currentStep={2} ariaLabel="Account setup progress" />
    );
    // Step 4 is upcoming — no "completed" or "current"
    const upcomingText = screen.getByText(/step 4 of 4.*review & submit/i);
    expect(upcomingText.textContent).not.toMatch(/completed|current/i);
  });
});

// ─── Step count ───────────────────────────────────────────────────────────────

describe('StepProgress — step count', () => {
  it('renders the correct number of list items', () => {
    render(
      <StepProgress steps={STEPS} currentStep={1} ariaLabel="Account setup progress" />
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('renders a single step correctly', () => {
    render(
      <StepProgress
        steps={[{ label: 'Only step' }]}
        currentStep={1}
        ariaLabel="Progress"
      />
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveAttribute('aria-current', 'step');
  });
});
