import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Accordion } from './Accordion';
import type { AccordionItem } from './Accordion';

const DEFAULT_ITEMS: AccordionItem[] = [
  { id: 'fees',     heading: 'What are the fees?',       panel: <p>No monthly fee for standard accounts.</p> },
  { id: 'limits',   heading: 'What are the limits?',     panel: <p>Daily transfer limit is £10,000.</p> },
  { id: 'interest', heading: 'How is interest calculated?', panel: <p>Interest is calculated daily.</p> },
];

function renderAccordion(props: Partial<React.ComponentProps<typeof Accordion>> = {}) {
  return render(<Accordion items={DEFAULT_ITEMS} {...props} />);
}

function getTrigger(name: string) {
  return screen.getByRole('button', { name });
}

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('Accordion — axe', () => {
  it('has no violations in default state (all closed)', async () => {
    const { container } = renderAccordion();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with one item open', async () => {
    const { container } = renderAccordion({ defaultOpen: ['fees'] });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with allowMultiple and all items open', async () => {
    const { container } = renderAccordion({
      allowMultiple: true,
      defaultOpen: ['fees', 'limits', 'interest'],
    });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with headingLevel=2', async () => {
    const { container } = renderAccordion({ headingLevel: 2 });
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Heading level (1.3.1) ────────────────────────────────────────────────────

describe('Accordion — heading level (1.3.1)', () => {
  it('wraps each trigger in an h3 by default', () => {
    renderAccordion();
    const headings = document.querySelectorAll('h3');
    expect(headings).toHaveLength(3);
  });

  it('uses the specified headingLevel', () => {
    renderAccordion({ headingLevel: 2 });
    expect(document.querySelectorAll('h2')).toHaveLength(3);
  });

  it('renders all trigger buttons inside headings', () => {
    renderAccordion();
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn.closest('h3')).toBeInTheDocument();
    });
  });
});

// ─── aria-expanded (4.1.2) ────────────────────────────────────────────────────

describe('Accordion — aria-expanded (4.1.2)', () => {
  it('all triggers have aria-expanded="false" by default', () => {
    renderAccordion();
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('defaultOpen items have aria-expanded="true"', () => {
    renderAccordion({ defaultOpen: ['fees'] });
    expect(getTrigger('What are the fees?')).toHaveAttribute('aria-expanded', 'true');
    expect(getTrigger('What are the limits?')).toHaveAttribute('aria-expanded', 'false');
  });

  it('clicking a trigger sets aria-expanded="true"', () => {
    renderAccordion();
    fireEvent.click(getTrigger('What are the fees?'));
    expect(getTrigger('What are the fees?')).toHaveAttribute('aria-expanded', 'true');
  });

  it('clicking an open trigger sets aria-expanded="false"', () => {
    renderAccordion({ defaultOpen: ['fees'] });
    fireEvent.click(getTrigger('What are the fees?'));
    expect(getTrigger('What are the fees?')).toHaveAttribute('aria-expanded', 'false');
  });
});

// ─── aria-controls / region linkage (4.1.2, 1.3.1) ───────────────────────────

describe('Accordion — aria-controls and region (4.1.2, 1.3.1)', () => {
  it('each trigger aria-controls points to its panel id', () => {
    renderAccordion({ defaultOpen: ['fees', 'limits', 'interest'] });
    const panels = screen.getAllByRole('region');
    screen.getAllByRole('button').forEach((trigger, i) => {
      expect(trigger.getAttribute('aria-controls')).toBe(panels[i].id);
    });
  });

  it('each panel has role="region"', () => {
    renderAccordion({ defaultOpen: ['fees', 'limits', 'interest'] });
    expect(screen.getAllByRole('region')).toHaveLength(3);
  });

  it('each panel aria-labelledby points to its trigger id', () => {
    renderAccordion({ defaultOpen: ['fees', 'limits', 'interest'] });
    const panels = screen.getAllByRole('region');
    screen.getAllByRole('button').forEach((trigger, i) => {
      expect(panels[i].getAttribute('aria-labelledby')).toBe(trigger.id);
    });
  });
});

// ─── Panel visibility (1.3.1) ─────────────────────────────────────────────────

describe('Accordion — panel visibility', () => {
  it('closed panels have the hidden attribute', () => {
    renderAccordion();
    // With all closed, query panels including hidden ones via DOM
    const panels = document.querySelectorAll('[role="region"]');
    panels.forEach((panel) => expect(panel).toHaveAttribute('hidden'));
  });

  it('open panel does not have the hidden attribute', () => {
    renderAccordion({ defaultOpen: ['fees'] });
    expect(screen.getByRole('region', { name: 'What are the fees?' })).not.toHaveAttribute('hidden');
  });

  it('clicking a trigger reveals its panel', () => {
    renderAccordion();
    fireEvent.click(getTrigger('What are the fees?'));
    expect(screen.getByRole('region', { name: 'What are the fees?' })).not.toHaveAttribute('hidden');
  });

  it('panel content is accessible when open', () => {
    renderAccordion({ defaultOpen: ['fees'] });
    expect(screen.getByText('No monthly fee for standard accounts.')).toBeInTheDocument();
  });
});

// ─── Single-open behaviour (allowMultiple=false) ──────────────────────────────

describe('Accordion — single-open behaviour (allowMultiple=false)', () => {
  it('opening a second item closes the first', () => {
    renderAccordion();
    fireEvent.click(getTrigger('What are the fees?'));
    fireEvent.click(getTrigger('What are the limits?'));
    expect(getTrigger('What are the fees?')).toHaveAttribute('aria-expanded', 'false');
    expect(getTrigger('What are the limits?')).toHaveAttribute('aria-expanded', 'true');
  });
});

// ─── Multi-open behaviour (allowMultiple=true) ────────────────────────────────

describe('Accordion — multi-open behaviour (allowMultiple=true)', () => {
  it('opening a second item keeps the first open', () => {
    renderAccordion({ allowMultiple: true });
    fireEvent.click(getTrigger('What are the fees?'));
    fireEvent.click(getTrigger('What are the limits?'));
    expect(getTrigger('What are the fees?')).toHaveAttribute('aria-expanded', 'true');
    expect(getTrigger('What are the limits?')).toHaveAttribute('aria-expanded', 'true');
  });

  it('closing one item leaves others open', () => {
    renderAccordion({ allowMultiple: true, defaultOpen: ['fees', 'limits'] });
    fireEvent.click(getTrigger('What are the fees?'));
    expect(getTrigger('What are the fees?')).toHaveAttribute('aria-expanded', 'false');
    expect(getTrigger('What are the limits?')).toHaveAttribute('aria-expanded', 'true');
  });
});

// ─── Keyboard operability (2.1.1) ─────────────────────────────────────────────

describe('Accordion — keyboard operability (2.1.1)', () => {
  it('first trigger is reachable by Tab', async () => {
    const user = userEvent.setup();
    renderAccordion();
    await user.tab();
    expect(getTrigger('What are the fees?')).toHaveFocus();
  });

  it('all triggers are in the tab order', async () => {
    const user = userEvent.setup();
    renderAccordion();
    await user.tab();
    expect(getTrigger('What are the fees?')).toHaveFocus();
    await user.tab();
    expect(getTrigger('What are the limits?')).toHaveFocus();
    await user.tab();
    expect(getTrigger('How is interest calculated?')).toHaveFocus();
  });

  it('Enter activates a trigger', async () => {
    const user = userEvent.setup();
    renderAccordion();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(getTrigger('What are the fees?')).toHaveAttribute('aria-expanded', 'true');
  });

  it('Space activates a trigger', async () => {
    const user = userEvent.setup();
    renderAccordion();
    await user.tab();
    await user.keyboard(' ');
    expect(getTrigger('What are the fees?')).toHaveAttribute('aria-expanded', 'true');
  });
});
