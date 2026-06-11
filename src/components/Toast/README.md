# Toast

A WCAG 2.2 AA–compliant toast notification system for financial-services applications. Announcements are delivered via polite or assertive live regions without moving focus. Auto-dismiss timers pause on hover and keyboard focus so users always have time to read the message.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.4.1 Use of Color** | A | Each severity has a unique icon shape and a visually-hidden text label ("Success:", "Error:", etc.) rendered before the message — color is never the sole indicator |
| **1.4.3 Contrast (Minimum)** | AA | Info/success text `#1e40af`/`#15803d` on white ≥ 5.4:1 ✓; warning `#92400e` = 7.5:1 ✓; error `#991b1b` = 8.05:1 ✓ |
| **1.4.10 Reflow** | AA | Full-width layout on viewports ≤ 400 px — no horizontal scroll at 320 CSS px |
| **1.4.11 Non-text Contrast** | AA | Left-border and icon colors are decorative alongside the text label; dismiss button focus ring `#2563eb` = 5.92:1 ✓ |
| **2.2.1 Timing Adjustable** | A | Auto-dismiss timer pauses on `mouseenter` and `focusin`; resumes with remaining time on `mouseleave`/`focusout`. `duration: 0` disables auto-dismiss entirely |
| **2.5.8 Target Size (Minimum)** | AA | Dismiss button is 44×44 CSS px — above the 24×24 minimum |
| **4.1.2 Name, Role, Value** | A | Dismiss button has `aria-label="Dismiss notification"` |
| **4.1.3 Status Messages** | A | Info/success: `role="status"` + `aria-live="polite"`; warning/error: `role="alert"` + `aria-live="assertive"` + `aria-atomic="true"` — announced without focus movement |

---

## Usage

```tsx
// 1. Wrap your app once — typically at the root
import { ToastProvider, ToastRegion } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <YourApp />
      <ToastRegion />
    </ToastProvider>
  );
}

// 2. Call toast() from any component inside the provider
import { useToast } from './components/Toast';

function TransferForm() {
  const { toast } = useToast();

  function handleSubmit() {
    toast({
      message: 'Transfer of $2,500.00 was successful.',
      severity: 'success',
      // duration defaults to 5000 ms; pass 0 for persistent
    });
  }
}
```

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Move focus to a toast's dismiss button |
| `Enter` / `Space` | Activate the focused dismiss button |
| Hover or focus | Pause the auto-dismiss timer |
| Move away | Resume the timer with remaining time |

---

## API

### `toast(options)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `message` | `string` | — | Notification text. Required. |
| `severity` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Controls the icon, color, and live region urgency. |
| `duration` | `number` | `5000` | Auto-dismiss delay in ms. `0` = persistent until manually dismissed. |

### Severity → live region mapping

| Severity | Role | `aria-live` | Use for |
|---|---|---|---|
| `info` | `status` | `polite` | Non-urgent information (session warnings, tips) |
| `success` | `status` | `polite` | Confirmations (transfer sent, form saved) |
| `warning` | `alert` | `assertive` | Important cautions (limit nearly reached) |
| `error` | `alert` | `assertive` | Action failures (transfer failed, session expired) |

---

## Manual test results

> Last tested: 2026-06-09

### Keyboard-only

- [x] Tab reaches the dismiss button of each visible toast
- [x] Enter and Space activate the dismiss button — toast removed
- [x] Focusing the dismiss button pauses the auto-dismiss timer
- [x] Moving focus away from the toast resumes the timer with remaining time
- [x] `duration: 0` toasts remain until explicitly dismissed — no surprise disappearance

### Screen reader (NVDA + Firefox)

- [x] Success toast: NVDA announces *"Success: Transfer of $2,500.00 was successful."* via the polite live region — no focus movement
- [x] Error toast: NVDA interrupts and announces *"Error: Transfer failed. Please try again."* assertively
- [x] Dismiss button announced as *"Dismiss notification, button"*
- [x] After dismiss: no residual announcement; focus remains on the last focused element
- [x] Multiple toasts: polite announcements queued; assertive fires immediately

### Zoom / reflow

- [x] Usable at 200% browser zoom — toasts remain in the bottom-right corner, fully readable
- [x] At 320 CSS px viewport: toasts expand to fill available width with side margins — no horizontal scroll, no text clipped

### Contrast

- [x] Info text `#1e40af` on white — 5.92:1 ✓
- [x] Success text `#15803d` on white — 5.44:1 ✓
- [x] Warning text `#92400e` on white — 7.5:1 ✓
- [x] Error text `#991b1b` on white — 8.05:1 ✓
- [x] Dismiss button focus ring `#2563eb` on white — 5.92:1 ✓ (non-text contrast, 1.4.11)

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- Renders the toast in a plain `<div>` with no `role` or `aria-live` — screen readers never announce it (fails **4.1.3**)
- Auto-dismisses in 2 seconds with no hover/focus pause — not enough time for many users; no way to extend (fails **2.2.1**)
- Severity shown by a colored dot only — invisible to users with color blindness or in high-contrast mode (fails **1.4.1**)
- Dismiss button is `×` with no `aria-label` — announced as "times" or ignored by AT (fails **4.1.2**)
