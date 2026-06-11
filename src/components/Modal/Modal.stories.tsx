import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant modal dialog for financial-services applications.

**WCAG success criteria satisfied:**

- **2.1.1 Keyboard:** Fully operable by keyboard — Tab and Shift+Tab stay trapped within the dialog; Escape closes it.
- **2.1.2 No Keyboard Trap:** The trap is intentionally escapable via Escape at any time.
- **2.4.3 Focus Order:** Focus moves into the dialog on open; returns to the triggering element on close.
- **2.4.7 Focus Visible:** \`focus-visible\` ring (3px solid #2563eb) on all interactive elements inside the dialog.
- **2.4.11 Focus Not Obscured (Minimum):** Dialog panel uses \`max-height\` + internal scroll — focused elements are never hidden behind the backdrop or clipped off-screen.
- **2.5.8 Target Size (Minimum):** Close button is 44×44 CSS px — above the 24×24 minimum.
- **4.1.2 Name, Role, Value:** \`role="dialog"\` + \`aria-modal="true"\`; \`aria-labelledby\` points to the visible title heading; \`aria-describedby\` set when a description is provided.

**Keyboard map:**

| Key | Action |
|-----|--------|
| \`Tab\` | Move focus to next focusable element — wraps at the last element |
| \`Shift+Tab\` | Move focus to previous focusable element — wraps at the first element |
| \`Escape\` | Close the dialog and return focus to the trigger |
| \`Enter\` / \`Space\` | Activate the focused button |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          style={triggerStyle}
        >
          Open modal
        </button>
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Confirm transfer"
        >
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.9375rem', color: '#374151' }}>
            You are about to transfer <strong>$2,500.00</strong> to John Smith. This action
            cannot be undone.
          </p>
          <div style={actionRow}>
            <button style={secondaryBtn} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button style={primaryBtn} onClick={() => setOpen(false)}>
              Confirm transfer
            </button>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Click the trigger to open. Tab stays inside the dialog; Escape or Cancel returns focus to the trigger. Screen readers hear "Confirm transfer, dialog" on entry.',
      },
    },
  },
};

// ─── With description ─────────────────────────────────────────────────────────

export const WithDescription: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)} style={triggerStyle}>
          Delete account
        </button>
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Delete account"
          description="All your data will be permanently removed. This cannot be undone."
        >
          <p style={{ margin: '0 0 1.25rem', fontSize: '0.9375rem', color: '#374151' }}>
            Type <strong>DELETE</strong> below to confirm.
          </p>
          <input
            type="text"
            aria-label="Type DELETE to confirm"
            placeholder="DELETE"
            style={{ ...inputStyle, marginBottom: '1.25rem' }}
          />
          <div style={actionRow}>
            <button style={secondaryBtn} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button style={{ ...primaryBtn, background: '#dc2626' }} onClick={() => setOpen(false)}>
              Delete account
            </button>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'The `description` prop sets `aria-describedby` on the dialog. Screen readers announce "All your data will be permanently removed…" as supplementary context when the dialog opens.',
      },
    },
  },
};

// ─── Long content (scroll) ────────────────────────────────────────────────────

export const LongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)} style={triggerStyle}>
          View terms
        </button>
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Terms and conditions"
          description="Please read carefully before proceeding."
        >
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i} style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#374151', lineHeight: 1.7 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          ))}
          <div style={actionRow}>
            <button style={secondaryBtn} onClick={() => setOpen(false)}>
              Decline
            </button>
            <button style={primaryBtn} onClick={() => setOpen(false)}>
              Accept
            </button>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Long content scrolls inside the panel — the panel itself never grows off-screen. Focused elements (the action buttons at the bottom) are always visible, satisfying **2.4.11 Focus Not Obscured**.',
      },
    },
  },
};

// ─── Custom initial focus ─────────────────────────────────────────────────────

export const CustomInitialFocus: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    return (
      <>
        <button onClick={() => setOpen(true)} style={triggerStyle}>
          Add payee
        </button>
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Add new payee"
          description="Enter the payee's details to save them for future transfers."
          initialFocusRef={inputRef}
        >
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="payee-name" style={labelStyle}>
              Payee name
            </label>
            <input
              id="payee-name"
              ref={inputRef}
              type="text"
              autoComplete="name"
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="account-number" style={labelStyle}>
              Account number
            </label>
            <input
              id="account-number"
              type="text"
              inputMode="numeric"
              style={inputStyle}
            />
          </div>
          <div style={actionRow}>
            <button style={secondaryBtn} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button style={primaryBtn} onClick={() => setOpen(false)}>
              Save payee
            </button>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'The `initialFocusRef` prop moves focus directly to the first input on open, skipping the close button — useful when the primary action is data entry.',
      },
    },
  },
};

// ─── Common Mistake ────────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessibleModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    // ✗ Plain <div> — no role="dialog", no aria-modal, no aria-labelledby
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          padding: '1.5rem',
          width: '100%',
          maxWidth: '32rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ✗ Heading is a plain <div> — not associated with the dialog as its accessible name */}
        <div style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '1rem' }}>
          Confirm transfer
        </div>
        <p style={{ marginBottom: '1.25rem', fontSize: '0.9375rem', color: '#374151' }}>
          You are about to transfer $2,500.00. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          {/* ✗ No focus trap — Tab escapes to background page content */}
          <button style={secondaryBtn} onClick={onClose}>Cancel</button>
          <button style={primaryBtn} onClick={onClose}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)} style={triggerStyle}>
          Open (inaccessible)
        </button>
        {/* ✗ Focus is not moved into the dialog on open */}
        {/* ✗ Focus is not returned to the trigger on close */}
        <InaccessibleModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

Open the dialog and press Tab — focus escapes to the browser chrome or background page content because there is no focus trap. Try it with a screen reader — the dialog is invisible to AT.

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| No \`role="dialog"\` or \`aria-modal\` | **4.1.2 Name, Role, Value** | AT does not know this is a dialog. NVDA and JAWS continue reading background content as if nothing changed. |
| No \`aria-labelledby\` | **4.1.2 Name, Role, Value** | The dialog has no programmatic name. Screen readers cannot announce what the dialog is about when it receives focus. |
| No focus trap | **2.1.1 Keyboard**, **2.1.2 No Keyboard Trap** | Tab moves focus out of the dialog into the page behind it. Keyboard-only users cannot operate the dialog without losing their place. |
| Focus not moved into dialog on open | **2.4.3 Focus Order** | Keyboard focus stays on the trigger button behind the backdrop. The user must Tab forward blind to reach the dialog content. |
| Focus not returned to trigger on close | **2.4.3 Focus Order** | After closing, focus lands on \`document.body\` or wherever the browser decides. The user loses their place in the page. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'aria-dialog-name', enabled: false },
          { id: 'dialog-name', enabled: false },
        ],
      },
    },
  },
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const triggerStyle: React.CSSProperties = {
  padding: '0.5rem 1.25rem',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 600,
  minHeight: '44px',
};

const primaryBtn: React.CSSProperties = {
  padding: '0.5rem 1.25rem',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 600,
  minHeight: '44px',
};

const secondaryBtn: React.CSSProperties = {
  padding: '0.5rem 1.25rem',
  background: '#fff',
  color: '#374151',
  border: '2px solid #d1d5db',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 600,
  minHeight: '44px',
};

const actionRow: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'flex-end',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.25rem',
  fontWeight: 500,
  fontSize: '0.875rem',
  color: '#374151',
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '1rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  boxSizing: 'border-box',
};
