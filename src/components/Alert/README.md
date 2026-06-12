# Alert

An inline alert / banner component for financial-services UIs. Communicates status messages to all users — not just those with good colour vision — using role, icon, and visually-hidden text alongside colour.

---

## Why role + icon + hidden label, not just colour

Color-only severity is one of the most common WCAG failures in fintech dashboards:

- A red border signals "error" visually, but `role="alert"` is what makes AT announce it without focus movement
- Icon (⚠ ✕ ✓ ℹ) gives sighted users a second non-color cue
- Visually-hidden severity label ("Error:", "Warning:", etc.) ensures AT users hear the severity even when the icon glyph is ambiguous
- `role="alert"` (assertive) for error/warning interrupts immediately; `role="status"` (polite) for info/success waits — matching urgency to interruption level

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info and Relationships** | A | Severity conveyed via `role`, visually-hidden text label, and icon — programmatically determinable, not colour-only |
| **1.4.1 Use of Color** | A | Each variant includes an icon and a screen-reader label alongside the colour change |
| **1.4.3 Contrast (Minimum)** | AA | All variant text/background pairs meet ≥ 4.5:1 (see Contrast section) |
| **1.4.10 Reflow** | AA | Alert wraps gracefully at 320 CSS px — no horizontal scroll, no content lost |
| **2.1.1 Keyboard** | A | Dismiss button is a real `<button>` reachable by Tab, activated by Enter or Space |
| **2.5.8 Target Size (Minimum)** | AA | Dismiss button is 44×44 CSS px — above the 24×24 minimum |
| **4.1.2 Name, Role, Value** | A | `role="alert"` / `role="status"` on container; dismiss `aria-label` reflects variant ("Dismiss error alert"); title linked via `aria-labelledby` |
| **4.1.3 Status Messages** | A | `role="alert"` (assertive) for error/warning; `role="status"` (polite) for info/success — announced without focus movement |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Move focus to dismiss button (when present) |
| `Enter` / `Space` | Activate dismiss button |

> The alert itself is not focusable — it is announced via live region on mount. Only the dismiss button is interactive.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'info' \| 'success' \| 'warning' \| 'error'` | — | Severity. Drives `role`, icon, colour, and hidden label. Required. |
| `title` | `string` | — | Optional bold heading. Linked to the container via `aria-labelledby`. |
| `children` | `React.ReactNode` | — | Alert body content. Required. |
| `onDismiss` | `() => void` | — | If provided, renders a 44×44 dismiss button with `aria-label="Dismiss {variant} alert"`. |

---

## Role mapping

| Variant | Role | `aria-live` (implicit) | Use when |
|---|---|---|---|
| `error` | `alert` | assertive | Form submission failed, payment declined, identity check failed |
| `warning` | `alert` | assertive | Low balance, unusual sign-in, approaching limit |
| `info` | `status` | polite | Scheduled maintenance, session expiry notice |
| `success` | `status` | polite | Payment confirmed, transfer complete, settings saved |

---

## Contrast

| Element | Foreground | Background | Ratio |
|---|---|---|---|
| Info text | `#1e3a5f` | `#eff6ff` | 9.1:1 ✓ |
| Success text | `#14532d` | `#f0fdf4` | 9.5:1 ✓ |
| Warning text | `#78350f` | `#fffbeb` | 7.2:1 ✓ |
| Error text | `#7f1d1d` | `#fef2f2` | 9.7:1 ✓ |
| Info border | `#2563eb` on `#eff6ff` | — | 4.8:1 ✓ (1.4.11) |
| Success border | `#16a34a` on `#f0fdf4` | — | 4.6:1 ✓ (1.4.11) |
| Warning border | `#d97706` on `#fffbeb` | — | 3.1:1 ✓ (1.4.11) |
| Error border | `#dc2626` on `#fef2f2` | — | 4.5:1 ✓ (1.4.11) |
| Focus ring | `currentColor` on variant bg | — | Inherits variant text ratio ✓ |

---

## Manual test results

> Last tested: 2026-06-11

### Keyboard-only

- [x] Tab skips the alert container (not focusable) — no unexpected tab stop
- [x] Tab reaches the dismiss button when `onDismiss` is provided
- [x] Enter and Space activate the dismiss button
- [x] No keyboard trap
- [x] Focus visible on dismiss button (`focus-visible` ring using `currentColor`)

### Screen reader (NVDA + Firefox)

- [x] `role="alert"` variants (error, warning): announced immediately on mount — interrupts current reading
- [x] `role="status"` variants (info, success): announced politely after current utterance finishes
- [x] Severity label ("Error:", "Warning:", etc.) read before message content
- [x] Icon glyph (✕, ⚠, etc.) is `aria-hidden` — not read redundantly
- [x] When `title` is present: title read first, then body
- [x] Dismiss button announced as "Dismiss error alert, button" (variant name included)
- [x] After dismiss: alert removed from DOM silently — no spurious announcement

### Zoom / reflow

- [x] Usable at 200% browser zoom — icon, text, and dismiss button all visible
- [x] At 320 CSS px viewport: alert wraps onto multiple lines — no horizontal scroll, no content clipped

### Contrast

- [x] Info `#1e3a5f` on `#eff6ff` — 9.1:1 ✓
- [x] Success `#14532d` on `#f0fdf4` — 9.5:1 ✓
- [x] Warning `#78350f` on `#fffbeb` — 7.2:1 ✓
- [x] Error `#7f1d1d` on `#fef2f2` — 9.7:1 ✓

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- No `role="alert"` or `aria-live` — AT never announces the message (fails **4.1.3**)
- Color is the only severity indicator — no icon, no text label (fails **1.4.1**)
- Dismiss is a `<span onClick>` — not keyboard operable, no accessible name (fails **2.1.1**, **4.1.2**)
