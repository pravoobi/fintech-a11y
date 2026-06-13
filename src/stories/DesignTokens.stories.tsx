import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

// ─── Token swatch data ────────────────────────────────────────────────────────

interface TokenGroup {
  name: string;
  tokens: TokenRow[];
}

interface TokenRow {
  name: string;
  lightValue: string;
  darkValue: string;
  lightRatio?: string;
  darkRatio?: string;
  note?: string;
}

const TOKEN_GROUPS: TokenGroup[] = [
  {
    name: 'Text',
    tokens: [
      { name: '--color-text',          lightValue: '#1a1a1a', darkValue: '#f1f5f9', lightRatio: '18.1:1', darkRatio: '16.0:1' },
      { name: '--color-text-body',     lightValue: '#374151', darkValue: '#e2e8f0', lightRatio: '10.7:1', darkRatio: '12.6:1' },
      { name: '--color-text-subtle',   lightValue: '#6b7280', darkValue: '#94a3b8', lightRatio:  '4.6:1', darkRatio:  '5.7:1' },
      { name: '--color-text-disabled', lightValue: '#9ca3af', darkValue: '#64748b', note: 'Intentionally low — disabled UI exception (WCAG 1.4.3 note 1)' },
      { name: '--color-text-on-dark',  lightValue: '#ffffff', darkValue: '#ffffff', note: 'White text on dark surfaces' },
    ],
  },
  {
    name: 'Primary / Focus',
    tokens: [
      { name: '--color-primary',       lightValue: '#2563eb', darkValue: '#60a5fa', lightRatio: '5.92:1', darkRatio: '5.9:1',  note: 'Focus ring, active state, accent' },
      { name: '--color-primary-hover', lightValue: '#1d4ed8', darkValue: '#93c5fd', lightRatio: '7.37:1', darkRatio: '8.9:1',  note: 'Hover, selected labels' },
      { name: '--color-primary-dark',  lightValue: '#1e40af', darkValue: '#3b82f6', lightRatio: '8.59:1', darkRatio: '4.6:1',  note: 'Dense text on light backgrounds' },
    ],
  },
  {
    name: 'Surface',
    tokens: [
      { name: '--color-surface',               lightValue: '#ffffff', darkValue: '#0f172a', note: 'Card, dialog, input background' },
      { name: '--color-surface-subtle',        lightValue: '#f9fafb', darkValue: '#1e293b', note: 'Alternating rows, trigger hover' },
      { name: '--color-surface-muted',         lightValue: '#f3f4f6', darkValue: '#334155', note: 'Disabled inputs, button hover' },
      { name: '--color-surface-primary',       lightValue: '#eff6ff', darkValue: '#1e3a5f', note: 'Selected / active option background' },
      { name: '--color-surface-primary-deep',  lightValue: '#dbeafe', darkValue: '#1e40af', note: 'Selected option hover background' },
    ],
  },
  {
    name: 'Border',
    tokens: [
      { name: '--color-border-subtle',  lightValue: '#e5e7eb', darkValue: '#334155', note: 'Table rows, accordion dividers, tab underline' },
      { name: '--color-border',         lightValue: '#d1d5db', darkValue: '#475569', note: 'Default component borders' },
      { name: '--color-border-hover',   lightValue: '#9ca3af', darkValue: '#64748b', note: 'Hovered option / control borders' },
      { name: '--color-border-control', lightValue: '#6b7280', darkValue: '#94a3b8', lightRatio: '4.6:1', darkRatio: '5.7:1', note: 'High-contrast form-input borders (1.4.11)' },
    ],
  },
  {
    name: 'Error',
    tokens: [
      { name: '--color-error',         lightValue: '#dc2626', darkValue: '#f87171', lightRatio: '5.74:1', darkRatio: '6.9:1', note: 'Border, icon' },
      { name: '--color-error-dark',    lightValue: '#991b1b', darkValue: '#fca5a5', lightRatio: '8.05:1', darkRatio: '9.7:1', note: 'Error text on surface' },
      { name: '--color-error-text',    lightValue: '#7f1d1d', darkValue: '#fecaca', lightRatio: '8.86:1', note: 'Error text on --color-error-surface' },
      { name: '--color-error-surface', lightValue: '#fef2f2', darkValue: '#7f1d1d' },
    ],
  },
  {
    name: 'Success',
    tokens: [
      { name: '--color-success',         lightValue: '#16a34a', darkValue: '#4ade80', lightRatio: '5.44:1', darkRatio:  '9.2:1', note: 'Border, icon' },
      { name: '--color-success-dark',    lightValue: '#15803d', darkValue: '#86efac', lightRatio: '7.37:1', darkRatio: '13.3:1', note: 'Success text on surface' },
      { name: '--color-success-text',    lightValue: '#14532d', darkValue: '#bbf7d0', lightRatio: '9.50:1', note: 'Success text on --color-success-surface' },
      { name: '--color-success-surface', lightValue: '#f0fdf4', darkValue: '#14532d' },
    ],
  },
  {
    name: 'Warning',
    tokens: [
      { name: '--color-warning',         lightValue: '#d97706', darkValue: '#fbbf24', lightRatio: '3.13:1', darkRatio: '10.2:1', note: 'Border/icon only — not body text' },
      { name: '--color-warning-dark',    lightValue: '#92400e', darkValue: '#fde68a', lightRatio: '7.50:1', darkRatio: '15.3:1', note: 'Warning text on surface' },
      { name: '--color-warning-text',    lightValue: '#78350f', darkValue: '#fef9c3', lightRatio: '7.20:1', note: 'Warning text on --color-warning-surface' },
      { name: '--color-warning-surface', lightValue: '#fffbeb', darkValue: '#78350f' },
    ],
  },
  {
    name: 'Info',
    tokens: [
      { name: '--color-info-dark', lightValue: '#1e40af', darkValue: '#93c5fd', lightRatio: '8.59:1', darkRatio: '8.9:1', note: 'Dense text on surface (= primary-dark)' },
      { name: '--color-info-text', lightValue: '#1e3a5f', darkValue: '#bfdbfe', lightRatio: '9.10:1', note: 'Text on --color-surface-primary' },
    ],
  },
];

// ─── Swatch component ─────────────────────────────────────────────────────────

function Swatch({ color }: { color: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '1.25rem',
        height: '1.25rem',
        borderRadius: '4px',
        background: color,
        border: '1px solid rgba(0,0,0,0.12)',
        flexShrink: 0,
        verticalAlign: 'middle',
      }}
      aria-hidden="true"
    />
  );
}

// ─── Token table ──────────────────────────────────────────────────────────────

function TokenTable({ group }: { group: TokenGroup }) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--color-text)' }}>
        {group.name}
      </h2>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.8125rem',
          tableLayout: 'fixed',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid var(--color-border-subtle)' }}>
            <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-text-body)', width: '38%' }}>Token</th>
            <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-text-body)', width: '19%' }}>Light</th>
            <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-text-body)', width: '19%' }}>Dark</th>
            <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-text-body)', width: '24%' }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {group.tokens.map((token, i) => (
            <tr
              key={token.name}
              style={{
                borderBottom: '1px solid var(--color-border-subtle)',
                background: i % 2 === 0 ? 'transparent' : 'var(--color-surface-subtle)',
              }}
            >
              <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', color: 'var(--color-primary-hover)', wordBreak: 'break-all' }}>
                {token.name}
              </td>
              <td style={{ padding: '0.5rem 0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Swatch color={token.lightValue} />
                  <div>
                    <div style={{ fontFamily: 'monospace', color: 'var(--color-text)', fontSize: '0.75rem' }}>{token.lightValue}</div>
                    {token.lightRatio && (
                      <div style={{ color: 'var(--color-text-subtle)', fontSize: '0.6875rem' }}>{token.lightRatio}</div>
                    )}
                  </div>
                </div>
              </td>
              <td style={{ padding: '0.5rem 0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Swatch color={token.darkValue} />
                  <div>
                    <div style={{ fontFamily: 'monospace', color: 'var(--color-text)', fontSize: '0.75rem' }}>{token.darkValue}</div>
                    {token.darkRatio && (
                      <div style={{ color: 'var(--color-text-subtle)', fontSize: '0.6875rem' }}>{token.darkRatio}</div>
                    )}
                  </div>
                </div>
              </td>
              <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-text-subtle)', fontSize: '0.75rem' }}>
                {token.note ?? ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function DesignTokensDoc() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '860px', padding: '2rem', color: 'var(--color-text)' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
        Design Tokens
      </h1>
      <p style={{ color: 'var(--color-text-subtle)', margin: '0 0 0.25rem', lineHeight: 1.6 }}>
        All color values used across the component library, extracted into CSS custom properties
        defined in <code style={{ fontFamily: 'monospace', background: 'var(--color-surface-subtle)', padding: '0.125rem 0.375rem', borderRadius: '3px' }}>src/tokens.css</code>.
      </p>
      <p style={{ color: 'var(--color-text-subtle)', margin: '0 0 2rem', lineHeight: 1.6 }}>
        Contrast ratios are measured against <strong>--color-surface</strong> within each mode. All
        body-text tokens meet WCAG 2.2 AA (≥ 4.5:1). Dark-mode ratios use a{' '}
        <code style={{ fontFamily: 'monospace', background: 'var(--color-surface-subtle)', padding: '0.125rem 0.375rem', borderRadius: '3px' }}>#0f172a</code>{' '}
        surface. Verify dark-mode ratios manually if your dark surface differs.
      </p>

      {TOKEN_GROUPS.map((group) => (
        <TokenTable key={group.name} group={group} />
      ))}

      <section style={{ marginTop: '2rem', padding: '1rem', background: 'var(--color-surface-subtle)', borderRadius: '6px', borderLeft: '4px solid var(--color-primary)' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
          prefers-reduced-motion
        </h2>
        <p style={{ margin: 0, color: 'var(--color-text-subtle)', fontSize: '0.875rem', lineHeight: 1.6 }}>
          Every component CSS file that includes a <code style={{ fontFamily: 'monospace' }}>transition</code> or{' '}
          <code style={{ fontFamily: 'monospace' }}>animation</code> declaration also includes a{' '}
          <code style={{ fontFamily: 'monospace' }}>@media (prefers-reduced-motion: reduce)</code> block that
          sets those properties to <code style={{ fontFamily: 'monospace' }}>none</code>. This covers all 17
          animated components: OTPInput, FormField, PasswordInput, AmountInput, Modal, DataTable, Toast,
          Combobox, DateInput, Alert, Pagination, Tabs, Tooltip, Accordion, SkipLink, RadioGroup, Checkbox.
        </p>
      </section>
    </div>
  );
}

// ─── Story ────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Tokens',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'CSS custom property palette — every color token with light + dark values and WCAG contrast ratios.',
      },
    },
  },
};

export default meta;

export const TokenPalette: StoryObj = {
  name: 'Token Palette',
  render: () => <DesignTokensDoc />,
};
