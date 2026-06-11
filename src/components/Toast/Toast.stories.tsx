import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ToastProvider, useToast } from '../../hooks/useToast';
import { ToastRegion } from './Toast';

// Stories wrap with ToastProvider + ToastRegion so each story is self-contained.

const meta: Meta = {
  title: 'Components/Toast',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant toast notification system for financial-services applications.

**Usage:**
\`\`\`tsx
// 1. Wrap your app (once)
<ToastProvider>
  <App />
  <ToastRegion />
</ToastProvider>

// 2. Call toast() anywhere inside the provider
const { toast } = useToast();
toast({ message: 'Transfer complete.', severity: 'success' });
\`\`\`

**WCAG success criteria satisfied:**

- **1.4.1 Use of Color:** Each severity has a unique icon shape and a visually-hidden text label ("Success:", "Error:", etc.) — color is never the sole indicator.
- **1.4.3 Contrast (Minimum):** All text meets ≥ 4.5:1 on white ✓.
- **1.4.10 Reflow:** Full-width on viewports ≤ 400 px — no horizontal scroll at 320 CSS px.
- **2.2.1 Timing Adjustable:** Auto-dismiss timer pauses on hover and keyboard focus; \`duration: 0\` disables auto-dismiss entirely.
- **2.5.8 Target Size (Minimum):** Dismiss button is 44×44 CSS px.
- **4.1.2 Name, Role, Value:** Dismiss button has \`aria-label="Dismiss notification"\`.
- **4.1.3 Status Messages:** Info/success use \`role="status"\` + \`aria-live="polite"\`; warning/error use \`role="alert"\` + \`aria-live="assertive"\` — announced without focus movement.

**Keyboard map:**

| Key | Action |
|-----|--------|
| \`Tab\` | Move focus to a toast's dismiss button |
| \`Enter\` / \`Space\` | Activate the focused dismiss button |
| Hover or focus | Pause the auto-dismiss timer |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ─── Shared button style ──────────────────────────────────────────────────────

const btnBase: React.CSSProperties = {
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 600,
  minHeight: '44px',
  color: '#fff',
};

// ─── All severities ───────────────────────────────────────────────────────────

export const AllSeverities: Story = {
  render: () => {
    function Inner() {
      const { toast } = useToast();
      return (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            style={{ ...btnBase, background: '#2563eb' }}
            onClick={() =>
              toast({ message: 'Your session will expire in 5 minutes.', severity: 'info', duration: 0 })
            }
          >
            Info
          </button>
          <button
            style={{ ...btnBase, background: '#16a34a' }}
            onClick={() =>
              toast({ message: 'Transfer of $2,500.00 was successful.', severity: 'success', duration: 0 })
            }
          >
            Success
          </button>
          <button
            style={{ ...btnBase, background: '#d97706' }}
            onClick={() =>
              toast({ message: 'Your daily transfer limit is almost reached.', severity: 'warning', duration: 0 })
            }
          >
            Warning
          </button>
          <button
            style={{ ...btnBase, background: '#dc2626' }}
            onClick={() =>
              toast({ message: 'Transfer failed. Please try again.', severity: 'error', duration: 0 })
            }
          >
            Error
          </button>
        </div>
      );
    }
    return (
      <ToastProvider>
        <Inner />
        <ToastRegion />
      </ToastProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Click each button to fire a toast. Each severity uses a unique icon shape alongside its color — screen readers hear "Success: Transfer of $2,500.00 was successful." via the polite live region. Dismiss toasts with the × button.',
      },
    },
  },
};

// ─── Auto-dismiss ─────────────────────────────────────────────────────────────

export const AutoDismiss: Story = {
  render: () => {
    function Inner() {
      const { toast } = useToast();
      return (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            style={{ ...btnBase, background: '#16a34a' }}
            onClick={() =>
              toast({ message: 'Saved. This dismisses in 3 seconds.', severity: 'success', duration: 3000 })
            }
          >
            3 s auto-dismiss
          </button>
          <button
            style={{ ...btnBase, background: '#2563eb' }}
            onClick={() =>
              toast({ message: 'Hover or focus me to pause the timer.', severity: 'info', duration: 5000 })
            }
          >
            5 s (hover to pause)
          </button>
        </div>
      );
    }
    return (
      <ToastProvider>
        <Inner />
        <ToastRegion />
      </ToastProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Toasts auto-dismiss after their `duration`. Hover over or Tab to focus the dismiss button — the timer pauses while the toast is hovered or focused, satisfying **2.2.1 Timing Adjustable**.',
      },
    },
  },
};

// ─── Persistent ───────────────────────────────────────────────────────────────

export const Persistent: Story = {
  render: () => {
    function Inner() {
      const { toast } = useToast();
      return (
        <button
          style={{ ...btnBase, background: '#dc2626' }}
          onClick={() =>
            toast({
              message: 'Account locked. Contact support to unlock.',
              severity: 'error',
              duration: 0,
            })
          }
        >
          Show persistent error
        </button>
      );
    }
    return (
      <ToastProvider>
        <Inner />
        <ToastRegion />
      </ToastProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`duration: 0` disables auto-dismiss entirely. Use for critical messages that require explicit acknowledgement — the user must click the dismiss button.',
      },
    },
  },
};

// ─── Multiple toasts ──────────────────────────────────────────────────────────

export const Multiple: Story = {
  render: () => {
    function Inner() {
      const { toast } = useToast();
      return (
        <button
          style={{ ...btnBase, background: '#2563eb' }}
          onClick={() => {
            toast({ message: 'Payment received from Alice Johnson.', severity: 'success', duration: 0 });
            toast({ message: 'New message from your advisor.', severity: 'info', duration: 0 });
            toast({ message: 'Scheduled payment due tomorrow.', severity: 'warning', duration: 0 });
          }}
        >
          Fire 3 toasts
        </button>
      );
    }
    return (
      <ToastProvider>
        <Inner />
        <ToastRegion />
      </ToastProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Multiple toasts stack in the region. Each is an independent live region item — AT queues polite announcements and fires assertive ones immediately.',
      },
    },
  },
};

// ─── Common Mistake ────────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessibleToast({
  message,
  severity,
  onDismiss,
}: {
  message: string;
  severity: string;
  onDismiss: () => void;
}) {
  const color = severity === 'success' ? '#16a34a' : severity === 'error' ? '#dc2626' : '#2563eb';

  return (
    // ✗ Plain <div> with no role or aria-live — AT never announces this (fails 4.1.3)
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        background: '#fff',
        borderLeft: `4px solid ${color}`,
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        maxWidth: '22rem',
        zIndex: 1100,
      }}
    >
      {/* ✗ Color dot is the only severity indicator — no icon shape, no text (fails 1.4.1) */}
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: '0.875rem' }}>{message}</span>
      {/* ✗ Icon-only button with no accessible name (fails 4.1.2) */}
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem' }}
      >
        ×
      </button>
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => {
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
      if (visible) {
        // ✗ Auto-dismisses in 2 s — far too short; no pause mechanism (fails 2.2.1)
        const t = setTimeout(() => setVisible(false), 2000);
        return () => clearTimeout(t);
      }
    }, [visible]);

    return (
      <div>
        <button style={{ ...btnBase, background: '#2563eb' }} onClick={() => setVisible(true)}>
          Show (inaccessible)
        </button>
        {visible && (
          <InaccessibleToast
            message="Transfer complete."
            severity="success"
            onDismiss={() => setVisible(false)}
          />
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

Click the button and watch the toast appear and vanish in 2 seconds. Open a screen reader — you will hear nothing.

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| No \`role\` or \`aria-live\` | **4.1.3 Status Messages** | The toast is injected into the DOM with no live region. Screen readers never announce it — the user has no idea the action succeeded. |
| Auto-dismisses in 2 seconds with no pause mechanism | **2.2.1 Timing Adjustable** | 2 s is not long enough for many users to read the message. There is no way to hover, focus, or otherwise extend the time. |
| Severity indicated by a colored dot only | **1.4.1 Use of Color** | Users with color blindness or high-contrast mode cannot distinguish success from error — the dot is the only indicator and its color is invisible to them. |
| Dismiss button is \`×\` with no \`aria-label\` | **4.1.2 Name, Role, Value** | Screen readers announce "×" or "times" — users cannot determine the button's purpose without visual context. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'button-name', enabled: false },
        ],
      },
    },
  },
};
