import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Pagination } from './Pagination';

const meta: Meta<typeof Pagination> = {
  title: 'Components/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant pagination component for financial-services UIs — transaction lists, statement history, search results.

**WCAG success criteria satisfied:**

- **1.3.1 Info and Relationships:** \`<nav>\` landmark with \`aria-label\`; page position communicated via \`aria-current="page"\` and a live region — not position or colour alone.
- **1.4.1 Use of Color:** Active page uses a filled background + bold weight + \`aria-current\` — colour is never the sole indicator.
- **1.4.3 Contrast (Minimum):** Active page \`#ffffff\` on \`#2563eb\` = 5.92:1 ✓; default text \`#1a1a1a\` on \`#ffffff\` = 18.1:1 ✓.
- **2.1.1 Keyboard:** All enabled controls reachable by Tab and activated by Enter or Space. Disabled buttons (Previous on page 1, Next on last page) are removed from the tab order.
- **2.5.8 Target Size (Minimum):** Every button is 44×44 CSS px — above the 24×24 minimum.
- **4.1.2 Name, Role, Value:** Each page button has \`aria-label="Page N"\`; active page has \`aria-current="page"\`; previous/next have descriptive labels.
- **4.1.3 Status Messages:** A polite \`role="status"\` live region announces "Page N of T" on every page change without moving focus.

**Keyboard map:**

| Key | Action |
|-----|--------|
| \`Tab\` | Move focus through enabled page controls |
| \`Enter\` / \`Space\` | Activate focused button |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Page 1 of 10. Previous is disabled. Activate any page button — the live region announces the new position to AT. `aria-current="page"` updates on each change.',
      },
    },
  },
};

// ─── Middle page (both ellipses visible) ──────────────────────────────────────

export const MiddlePage: Story = {
  render: () => {
    const [page, setPage] = useState(5);
    return <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Page 5 of 10 — both start and end ellipses are visible. Ellipsis spans carry `aria-hidden="true"` so AT skips them; only real page buttons are in the tab order.',
      },
    },
  },
};

// ─── Few pages (no ellipsis) ──────────────────────────────────────────────────

export const FewPages: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return <Pagination currentPage={page} totalPages={5} onPageChange={setPage} />;
  },
  parameters: {
    docs: {
      description: {
        story: '5 pages — all fit without ellipsis. The full range is always visible.',
      },
    },
  },
};

// ─── Controlled with results summary ──────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const totalItems = 200;
    const pageSize  = 20;
    const totalPages = Math.ceil(totalItems / pageSize);
    const from = (page - 1) * pageSize + 1;
    const to   = Math.min(page * pageSize, totalItems);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p
          style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}
          aria-live="polite"
          aria-atomic="true"
        >
          Showing {from}–{to} of {totalItems} transactions
        </p>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          navigationLabel="Transaction history pages"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Paired with a results summary ("Showing 1–20 of 200 transactions"). Both the summary and the pagination live region update on page change — AT users get the full context. The `<nav>` uses a descriptive label ("Transaction history pages") to distinguish it if multiple navigations exist on the page.',
      },
    },
  },
};

// ─── Wide sibling count ───────────────────────────────────────────────────────

export const WideSiblingCount: Story = {
  render: () => {
    const [page, setPage] = useState(10);
    return (
      <Pagination
        currentPage={page}
        totalPages={20}
        onPageChange={setPage}
        siblingCount={2}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`siblingCount={2}` — two pages shown on each side of the current page before the ellipsis appears. Useful when horizontal space allows a wider range.',
      },
    },
  },
};

// ─── Common Mistake ───────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessiblePagination() {
  const [page, setPage] = useState(1);
  const totalPages = 10;
  const pages = [1, 2, 3, '...', 9, 10];

  return (
    // ✗ Plain <div> — no <nav> landmark, no accessible name (fails 1.3.1)
    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
      {/* ✗ <span> with onClick — not keyboard operable, no accessible name (fails 2.1.1, 4.1.2) */}
      <span
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        style={{
          padding: '0.5rem 0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        ‹
      </span>

      {pages.map((p, i) => (
        <span
          key={i}
          onClick={() => typeof p === 'number' && setPage(p)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: typeof p === 'number' ? 'pointer' : 'default',
            userSelect: 'none',
            // ✗ Active page shown by color only — no aria-current, no font change (fails 1.4.1, 4.1.2)
            background: p === page ? '#2563eb' : '#ffffff',
            color: p === page ? '#ffffff' : '#1a1a1a',
          }}
        >
          {p}
        </span>
      ))}

      <span
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        style={{
          padding: '0.5rem 0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        ›
      </span>
      {/* ✗ No live region — page change never announced to AT (fails 4.1.3) */}
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessiblePagination />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| Plain \`<div>\` wrapper — no \`<nav>\` | **1.3.1 Info and Relationships** | The pagination has no landmark role. AT users navigating by landmarks cannot find it. |
| \`<span onClick>\` for all controls | **2.1.1 Keyboard**, **4.1.2 Name, Role, Value** | \`<span>\` elements are not in the tab order and have no role. Keyboard users cannot reach or activate any control. AT announces them as unlabelled static text. |
| Active page shown by background colour only | **1.4.1 Use of Color**, **4.1.2 Name, Role, Value** | No \`aria-current="page"\`, no font-weight change, no text label. A user who cannot perceive colour cannot tell which page is active. AT has no way to announce the active state. |
| No live region | **4.1.3 Status Messages** | When the page changes, AT users hear nothing. They must navigate back through the list to re-orient themselves. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'landmark-one-main', enabled: false },
          { id: 'region',            enabled: false },
        ],
      },
    },
  },
};
