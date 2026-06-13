import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { SkipLink } from './SkipLink';

const meta: Meta<typeof SkipLink> = {
  title: 'Components/SkipLink',
  component: SkipLink,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A "Skip to main content" link — the first focusable element on every page. Visually hidden until focused, then slides into view so sighted keyboard users can see and activate it.

**WCAG success criterion satisfied:**

- **2.4.1 Bypass Blocks** (Level A): Provides a mechanism to skip past blocks of content repeated on every page (site navigation, header) and jump directly to the main content area. Without this, keyboard users must Tab through every nav link on every page load.

**Supporting criteria:**

- **2.4.7 Focus Visible:** The link slides into view and is clearly visible when focused.
- **1.4.3 Contrast:** Link text \`#ffffff\` on \`#1d4ed8\` = 7.2:1 ✓.

**Integration requirements:**

1. Place \`<SkipLink />\` as the **very first element** inside \`<body>\` (before the site header and navigation).
2. The target element must have \`tabIndex={-1}\` so focus moves there reliably across all browsers:

\`\`\`tsx
<SkipLink />
<header>…nav…</header>
<main id="main-content" tabIndex={-1}>
  …page content…
</main>
\`\`\`

Without \`tabIndex={-1}\` on the target, some browsers scroll to the anchor but leave focus behind the nav — the next Tab keypress lands on the first nav item again, defeating the purpose.
        `,
      },
    },
    // Disable the a11y addon's region rule for these stories — they render
    // partial page layouts without a full landmark structure
    a11y: {
      config: {
        rules: [{ id: 'region', enabled: false }],
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SkipLink>;

// ─── Shared mock page layout ──────────────────────────────────────────────────

function MockPage({
  skipLink,
  mainId = 'main-content',
}: {
  skipLink: React.ReactNode;
  mainId?: string;
}) {
  return (
    <div style={{ fontFamily: 'inherit', fontSize: '0.875rem' }}>
      {skipLink}

      {/* Simulated site header with nav */}
      <header
        style={{
          background: '#1e3a5f',
          color: '#ffffff',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontWeight: 700 }}>FinanceApp</span>
        <nav aria-label="Main navigation">
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              gap: '1rem',
            }}
          >
            {['Dashboard', 'Accounts', 'Payments', 'Statements', 'Settings'].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{ color: '#ffffff', textDecoration: 'none' }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Main content area — tabIndex={-1} so skip link focus lands here */}
      <main
        id={mainId}
        tabIndex={-1}
        style={{
          padding: '1.5rem 1rem',
          outline: 'none',
        }}
      >
        <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.25rem', color: '#1a1a1a' }}>
          Account overview
        </h1>
        <p style={{ margin: 0, color: '#374151' }}>
          Tab into this page. The first Tab keypress should reveal the skip link at the top of the
          viewport. Activate it (Enter) and the next Tab moves through content here, not back through
          the navigation.
        </p>
      </main>
    </div>
  );
}

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <MockPage skipLink={<SkipLink />} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Tab into the story — the skip link slides in at the top-left. Press Enter to activate it. Focus jumps to `<main>` — the next Tab moves through page content, bypassing all five nav links. Without the skip link, reaching "Account overview" would require six Tab presses on every page.',
      },
    },
  },
};

// ─── Custom label ─────────────────────────────────────────────────────────────

export const CustomLabel: Story = {
  render: () => (
    <MockPage
      skipLink={<SkipLink label="Skip to account summary" targetId="account-summary" />}
      mainId="account-summary"
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Custom `label` and `targetId` — useful when the page has multiple landmark regions and you want to name the destination precisely (e.g. "Skip to account summary", "Skip to transaction list").',
      },
    },
  },
};

// ─── Common Mistake ───────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessibleSkipLink() {
  return (
    <div style={{ fontFamily: 'inherit', fontSize: '0.875rem' }}>
      {/*
        ✗ display:none — the link is permanently hidden and cannot receive focus.
          Keyboard users cannot activate it. It exists in the HTML but provides
          no benefit (fails 2.4.1).
      */}
      <a
        href="#main-content"
        style={{ display: 'none' }}
      >
        Skip to main content
      </a>

      <header
        style={{
          background: '#1e3a5f',
          color: '#ffffff',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontWeight: 700 }}>FinanceApp</span>
        <nav aria-label="Main navigation">
          <ul
            style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '1rem' }}
          >
            {['Dashboard', 'Accounts', 'Payments', 'Statements', 'Settings'].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{ color: '#ffffff', textDecoration: 'none' }}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/*
        ✗ No tabIndex={-1} on the target — activating the skip link scrolls
          the viewport but focus stays behind the nav. The next Tab press
          lands on "Dashboard", not the page content (fails 2.4.1 in practice).
      */}
      <main id="main-content" style={{ padding: '1.5rem 1rem' }}>
        <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.25rem', color: '#1a1a1a' }}>
          Account overview
        </h1>
        <p style={{ margin: 0, color: '#374151' }}>
          Tab into this page. Count how many Tab presses it takes to reach this paragraph.
        </p>
      </main>
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessibleSkipLink />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

Tab into the story and count how many presses it takes to reach "Account overview". You must Tab through all five nav links — Dashboard, Accounts, Payments, Statements, Settings — before reaching the main content. On a real page with a full header, sidebar, and breadcrumb, this is 20–30 Tab presses on every single page load.

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| Skip link hidden with \`display:none\` | **2.4.1 Bypass Blocks** | The link can never receive focus — it is completely inert. It exists in the HTML but provides no mechanism to bypass the navigation. |
| Target \`<main>\` has no \`tabIndex={-1}\` | **2.4.1 Bypass Blocks** (in practice) | When the skip link is activated, the browser scrolls to the anchor but focus stays on the link. The next Tab press lands back at the first nav item, not in the main content — the skip link does nothing useful. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'skip-link', enabled: false },
          { id: 'region',    enabled: false },
        ],
      },
    },
  },
};
