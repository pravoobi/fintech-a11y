import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Alert } from './Alert';
import type { AlertVariant } from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
An inline alert / banner component for financial-services UIs. Communicates status messages to all users — not just those with good colour vision.

**WCAG success criteria satisfied:**

- **1.3.1 Info and Relationships:** Severity is conveyed via \`role="alert"\` / \`role="status"\`, a visually-hidden text label ("Error:", "Warning:", etc.), and an icon — not only by colour or position.
- **1.4.1 Use of Color:** Each variant includes an icon and a screen-reader label alongside the colour change — colour is never the sole indicator.
- **1.4.3 Contrast (Minimum):** All variant text/background combinations meet ≥ 4.5:1 ✓.
- **2.1.1 Keyboard:** Dismiss button is a real \`<button>\` reachable by Tab, activated by Enter or Space.
- **2.5.8 Target Size (Minimum):** Dismiss button is 44×44 CSS px — above the 24×24 minimum.
- **4.1.2 Name, Role, Value:** Dismiss button has a descriptive \`aria-label\` ("Dismiss error alert"). Title linked via \`aria-labelledby\`.
- **4.1.3 Status Messages:** \`role="alert"\` (assertive) for \`error\` and \`warning\`; \`role="status"\` (polite) for \`info\` and \`success\` — announcements reach AT without focus movement.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

// ─── Info ─────────────────────────────────────────────────────────────────────

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Your session will expire in 5 minutes. Save your progress to avoid losing data.',
  },
  parameters: {
    docs: {
      description: {
        story: '`role="status"` (polite) — announced by AT without interrupting the current task.',
      },
    },
  },
};

// ─── Success ──────────────────────────────────────────────────────────────────

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Payment of £1,250.00 processed successfully. A confirmation has been sent to your email.',
  },
  parameters: {
    docs: {
      description: {
        story: '`role="status"` (polite) — success feedback announced without interrupting.',
      },
    },
  },
};

// ─── Warning ──────────────────────────────────────────────────────────────────

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Your account balance is below the minimum threshold. A £12.00 fee may apply.',
  },
  parameters: {
    docs: {
      description: {
        story: '`role="alert"` (assertive) — warnings interrupt immediately so the user is not surprised.',
      },
    },
  },
};

// ─── Error ────────────────────────────────────────────────────────────────────

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'We could not process your payment. Check your card details and try again.',
  },
  parameters: {
    docs: {
      description: {
        story: '`role="alert"` (assertive) — errors interrupt immediately so the problem is not missed.',
      },
    },
  },
};

// ─── With title ───────────────────────────────────────────────────────────────

export const WithTitle: Story = {
  args: {
    variant: 'error',
    title: 'Payment failed',
    children: 'We could not charge the card ending in 4242. Check your details or use a different card.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'When `title` is provided it is rendered as a bold heading and linked to the alert container via `aria-labelledby` — the full accessible name is announced on entry.',
      },
    },
  },
};

// ─── Dismissible ──────────────────────────────────────────────────────────────

export const Dismissible: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);

    return visible ? (
      <Alert variant="info" title="Scheduled maintenance" onDismiss={() => setVisible(false)}>
        Our systems will be unavailable on Sunday 15 June from 02:00–04:00 BST.
      </Alert>
    ) : (
      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
        Alert dismissed — Tab to this area to confirm the button worked.
      </p>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'The dismiss control is a real `<button>` (not a `<span>`) with `aria-label="Dismiss info alert"`. It is 44×44 CSS px (2.5.8). Focus remains on the button until clicked — no unexpected focus movement.',
      },
    },
  },
};

// ─── All variants ─────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  render: () => {
    const variants: { variant: AlertVariant; title: string; message: string }[] = [
      {
        variant: 'info',
        title: 'Direct debit set up',
        message: 'Your first payment of £45.00 will be collected on 1 July 2026.',
      },
      {
        variant: 'success',
        title: 'Transfer complete',
        message: '£2,500.00 has been sent to J. Smith — ref TXN-8821.',
      },
      {
        variant: 'warning',
        title: 'Unusual sign-in detected',
        message: 'We noticed a sign-in from a new device in London. If this was you, no action is needed.',
      },
      {
        variant: 'error',
        title: 'Identity check failed',
        message: 'We could not verify your identity. Upload a clearer photo of your passport.',
      },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {variants.map(({ variant, title, message }) => (
          <Alert key={variant} variant={variant} title={title}>
            {message}
          </Alert>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'All four variants side by side. Each uses a distinct icon, visually-hidden severity label, and accessible role — severity is never communicated by colour alone.',
      },
    },
  },
};

// ─── Common Mistake ───────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessibleAlert() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return (
      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
        Alert dismissed.
      </p>
    );
  }

  return (
    // ✗ Plain <div> — no role="alert" or aria-live, so AT never announces this (fails 4.1.3)
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        padding: '0.875rem 1rem',
        // ✗ Red background + border is the ONLY indicator of severity (fails 1.4.1)
        background: '#fef2f2',
        borderLeft: '4px solid #dc2626',
        borderRadius: '6px',
        fontSize: '0.875rem',
        color: '#7f1d1d',
      }}
    >
      <div style={{ flex: 1 }}>
        {/* ✗ No icon, no text label — only color differentiates this from a neutral message (fails 1.4.1) */}
        We could not process your payment. Check your card details and try again.
      </div>
      {/* ✗ <span> with onClick is not keyboard operable — Tab skips it (fails 2.1.1, 4.1.2) */}
      {/* ✗ No accessible name — announced as unlabelled clickable element (fails 4.1.2) */}
      <span
        onClick={() => setVisible(false)}
        style={{ cursor: 'pointer', fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}
      >
        ✕
      </span>
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessibleAlert />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| No \`role="alert"\` or \`aria-live\` | **4.1.3 Status Messages** | AT never announces the message. A screen reader user submitting a payment form would hear nothing when the error appears — they'd have no idea it failed. |
| Color is the only severity indicator | **1.4.1 Use of Color** | Red background and border distinguish this from an info message — but a user who cannot perceive color sees no difference in meaning. No icon, no text label, no role. |
| Dismiss is a \`<span onClick>\` | **2.1.1 Keyboard**, **4.1.2 Name, Role, Value** | \`<span>\` is not in the tab order and has no \`role="button"\`. Keyboard users cannot dismiss the alert. AT announces it as unlabelled static text. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'aria-allowed-role', enabled: false },
        ],
      },
    },
  },
};
