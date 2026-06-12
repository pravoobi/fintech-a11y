import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { Tabs } from './Tabs';
import type { Tab } from './Tabs';

const DEFAULT_TABS: Tab[] = [
  { id: 'overview',      label: 'Overview',      panel: <p>Overview content</p> },
  { id: 'transactions',  label: 'Transactions',  panel: <p>Transactions content</p> },
  { id: 'statements',    label: 'Statements',    panel: <p>Statements content</p> },
];

const TABS_WITH_DISABLED: Tab[] = [
  { id: 'overview',      label: 'Overview',      panel: <p>Overview content</p> },
  { id: 'transactions',  label: 'Transactions',  panel: <p>Transactions content</p>, disabled: true },
  { id: 'statements',    label: 'Statements',    panel: <p>Statements content</p> },
];

function renderTabs(props: Partial<React.ComponentProps<typeof Tabs>> = {}) {
  return render(
    <Tabs
      tabs={DEFAULT_TABS}
      label="Account sections"
      {...props}
    />,
  );
}

function getTab(name: string) {
  return screen.getByRole('tab', { name });
}

// ─── Axe ──────────────────────────────────────────────────────────────────────

describe('Tabs — axe', () => {
  it('has no violations in default state', async () => {
    const { container } = renderTabs();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a disabled tab', async () => {
    const { container } = renderTabs({ tabs: TABS_WITH_DISABLED });
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations with a non-default selected tab', async () => {
    const { container } = renderTabs({ defaultTab: 'statements' });
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── Tablist (1.3.1, 4.1.2) ──────────────────────────────────────────────────

describe('Tabs — tablist', () => {
  it('renders a role="tablist"', () => {
    renderTabs();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('tablist has the provided aria-label', () => {
    renderTabs({ label: 'Account sections' });
    expect(screen.getByRole('tablist')).toHaveAccessibleName('Account sections');
  });
});

// ─── Tab buttons (4.1.2) ──────────────────────────────────────────────────────

describe('Tabs — tab buttons (4.1.2)', () => {
  it('renders a tab for each entry', () => {
    renderTabs();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('first tab is selected by default', () => {
    renderTabs();
    expect(getTab('Overview')).toHaveAttribute('aria-selected', 'true');
  });

  it('defaultTab prop sets the initial selection', () => {
    renderTabs({ defaultTab: 'statements' });
    expect(getTab('Statements')).toHaveAttribute('aria-selected', 'true');
    expect(getTab('Overview')).toHaveAttribute('aria-selected', 'false');
  });

  it('non-selected tabs have aria-selected="false"', () => {
    renderTabs();
    expect(getTab('Transactions')).toHaveAttribute('aria-selected', 'false');
    expect(getTab('Statements')).toHaveAttribute('aria-selected', 'false');
  });

  it('selected tab has tabIndex=0', () => {
    renderTabs();
    expect(getTab('Overview')).toHaveAttribute('tabindex', '0');
  });

  it('non-selected tabs have tabIndex=-1', () => {
    renderTabs();
    expect(getTab('Transactions')).toHaveAttribute('tabindex', '-1');
    expect(getTab('Statements')).toHaveAttribute('tabindex', '-1');
  });

  it('disabled tab is marked disabled', () => {
    renderTabs({ tabs: TABS_WITH_DISABLED });
    expect(getTab('Transactions')).toBeDisabled();
  });
});

// ─── aria-controls / aria-labelledby linkage (4.1.2) ─────────────────────────

describe('Tabs — aria-controls and aria-labelledby (4.1.2)', () => {
  it('each tab aria-controls points to its panel id', () => {
    renderTabs();
    const tabs = screen.getAllByRole('tab');
    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    tabs.forEach((tab, i) => {
      expect(tab.getAttribute('aria-controls')).toBe(panels[i].id);
    });
  });

  it('each panel aria-labelledby points to its tab id', () => {
    renderTabs();
    const tabs = screen.getAllByRole('tab');
    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    tabs.forEach((tab, i) => {
      expect(panels[i].getAttribute('aria-labelledby')).toBe(tab.id);
    });
  });
});

// ─── Panels (1.3.1, 4.1.2) ───────────────────────────────────────────────────

describe('Tabs — panels', () => {
  it('renders a tabpanel for each tab', () => {
    renderTabs();
    expect(screen.getAllByRole('tabpanel', { hidden: true })).toHaveLength(3);
  });

  it('active panel is visible', () => {
    renderTabs();
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).not.toHaveAttribute('hidden');
  });

  it('inactive panels are hidden', () => {
    renderTabs();
    const panels = screen.getAllByRole('tabpanel', { hidden: true });
    const hiddenPanels = panels.filter((p) => p.hasAttribute('hidden'));
    expect(hiddenPanels).toHaveLength(2);
  });

  it('active panel has tabIndex=0', () => {
    renderTabs();
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toHaveAttribute('tabindex', '0');
  });
});

// ─── Click activation ─────────────────────────────────────────────────────────

describe('Tabs — click activation', () => {
  it('clicking a tab activates it', () => {
    renderTabs();
    fireEvent.click(getTab('Transactions'));
    expect(getTab('Transactions')).toHaveAttribute('aria-selected', 'true');
    expect(getTab('Overview')).toHaveAttribute('aria-selected', 'false');
  });

  it('clicking a tab shows its panel', () => {
    renderTabs();
    // Capture Overview panel reference while it is still visible (in the a11y tree)
    const overviewPanel = screen.getByRole('tabpanel', { name: 'Overview' });
    fireEvent.click(getTab('Transactions'));
    expect(screen.getByRole('tabpanel', { name: 'Transactions' })).not.toHaveAttribute('hidden');
    expect(overviewPanel).toHaveAttribute('hidden');
  });

  it('calls onChange with the tab id when a tab is clicked', () => {
    const onChange = vi.fn();
    renderTabs({ onChange });
    fireEvent.click(getTab('Statements'));
    expect(onChange).toHaveBeenCalledWith('statements');
  });

  it('does not activate a disabled tab on click', () => {
    renderTabs({ tabs: TABS_WITH_DISABLED });
    fireEvent.click(getTab('Transactions'));
    expect(getTab('Transactions')).toHaveAttribute('aria-selected', 'false');
    expect(getTab('Overview')).toHaveAttribute('aria-selected', 'true');
  });
});

// ─── Arrow key navigation (2.1.1) ─────────────────────────────────────────────

describe('Tabs — arrow key navigation (2.1.1)', () => {
  it('ArrowRight moves focus and activates the next tab', () => {
    renderTabs();
    getTab('Overview').focus();
    fireEvent.keyDown(getTab('Overview'), { key: 'ArrowRight' });
    expect(getTab('Transactions')).toHaveFocus();
    expect(getTab('Transactions')).toHaveAttribute('aria-selected', 'true');
  });

  it('ArrowLeft moves focus and activates the previous tab', () => {
    renderTabs();
    fireEvent.click(getTab('Transactions'));
    getTab('Transactions').focus();
    fireEvent.keyDown(getTab('Transactions'), { key: 'ArrowLeft' });
    expect(getTab('Overview')).toHaveFocus();
    expect(getTab('Overview')).toHaveAttribute('aria-selected', 'true');
  });

  it('ArrowRight wraps from last to first tab', () => {
    renderTabs();
    fireEvent.click(getTab('Statements'));
    getTab('Statements').focus();
    fireEvent.keyDown(getTab('Statements'), { key: 'ArrowRight' });
    expect(getTab('Overview')).toHaveFocus();
    expect(getTab('Overview')).toHaveAttribute('aria-selected', 'true');
  });

  it('ArrowLeft wraps from first to last tab', () => {
    renderTabs();
    getTab('Overview').focus();
    fireEvent.keyDown(getTab('Overview'), { key: 'ArrowLeft' });
    expect(getTab('Statements')).toHaveFocus();
    expect(getTab('Statements')).toHaveAttribute('aria-selected', 'true');
  });

  it('Home activates the first tab', () => {
    renderTabs();
    fireEvent.click(getTab('Statements'));
    getTab('Statements').focus();
    fireEvent.keyDown(getTab('Statements'), { key: 'Home' });
    expect(getTab('Overview')).toHaveFocus();
    expect(getTab('Overview')).toHaveAttribute('aria-selected', 'true');
  });

  it('End activates the last tab', () => {
    renderTabs();
    getTab('Overview').focus();
    fireEvent.keyDown(getTab('Overview'), { key: 'End' });
    expect(getTab('Statements')).toHaveFocus();
    expect(getTab('Statements')).toHaveAttribute('aria-selected', 'true');
  });

  it('ArrowRight skips a disabled tab', () => {
    renderTabs({ tabs: TABS_WITH_DISABLED });
    getTab('Overview').focus();
    fireEvent.keyDown(getTab('Overview'), { key: 'ArrowRight' });
    // Transactions is disabled — should skip to Statements
    expect(getTab('Statements')).toHaveFocus();
    expect(getTab('Statements')).toHaveAttribute('aria-selected', 'true');
  });

  it('ArrowLeft skips a disabled tab', () => {
    renderTabs({ tabs: TABS_WITH_DISABLED });
    fireEvent.click(getTab('Statements'));
    getTab('Statements').focus();
    fireEvent.keyDown(getTab('Statements'), { key: 'ArrowLeft' });
    // Transactions is disabled — should skip to Overview
    expect(getTab('Overview')).toHaveFocus();
    expect(getTab('Overview')).toHaveAttribute('aria-selected', 'true');
  });
});

// ─── Keyboard tab order (2.1.1, 2.4.3) ────────────────────────────────────────

describe('Tabs — keyboard tab order (2.1.1, 2.4.3)', () => {
  it('Tab reaches the selected tab button', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.tab();
    expect(getTab('Overview')).toHaveFocus();
  });

  it('Tab from the selected tab moves to the active panel', async () => {
    const user = userEvent.setup();
    renderTabs();
    await user.tab();
    expect(getTab('Overview')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toHaveFocus();
  });
});
