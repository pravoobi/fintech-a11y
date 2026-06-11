# Modal

A WCAG 2.2 AA–compliant modal dialog for financial-services applications. Traps keyboard focus within the dialog, returns focus to the trigger on close, and locks background scroll — all implemented via a reusable `useFocusTrap` hook.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **2.1.1 Keyboard** | A | Fully operable by keyboard — Tab and Shift+Tab stay trapped within the dialog; Escape closes it |
| **2.1.2 No Keyboard Trap** | A | The trap is always escapable via Escape |
| **2.4.3 Focus Order** | A | Focus moves into the dialog on open (first focusable element or `initialFocusRef`); returns to the triggering element on close |
| **2.4.7 Focus Visible** | AA | `focus-visible` ring (3px solid `#2563eb`) on all interactive elements; suppressed only on the panel's `tabIndex=-1` fallback target |
| **2.4.11 Focus Not Obscured (Minimum)** | AA | Panel uses `max-height: calc(100vh - 2rem)` with internal scroll — focused elements are never hidden behind the backdrop or clipped off-screen |
| **2.5.8 Target Size (Minimum)** | AA | Close button is 44×44 CSS px — above the 24×24 px minimum |
| **4.1.2 Name, Role, Value** | A | `role="dialog"` + `aria-modal="true"`; `aria-labelledby` points to the visible `<h2>` title; `aria-describedby` set when a description prop is provided |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Move focus to next focusable element inside the dialog — wraps from last to first |
| `Shift+Tab` | Move focus to previous focusable element — wraps from first to last |
| `Escape` | Close the dialog and return focus to the triggering element |
| `Enter` / `Space` | Activate the focused button |

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | — | Controls visibility. Required. |
| `onClose` | `() => void` | — | Called on Escape, backdrop click, or close button. Required. |
| `title` | `string` | — | Visible dialog heading. Also the accessible name via `aria-labelledby`. Required. |
| `description` | `string` | — | Optional subheading linked via `aria-describedby`. Announced as supplementary context on dialog entry. |
| `children` | `ReactNode` | — | Modal body content. Required. |
| `initialFocusRef` | `RefObject<HTMLElement>` | — | Element to focus on open. Defaults to the first focusable element in the dialog. |

---

## `useFocusTrap` hook

Lives in `src/hooks/useFocusTrap.ts`. Accepts `{ isActive, onEscape, initialFocusRef? }` and returns a `containerRef` to attach to the trap container. Reusable by any component that needs a focus trap (e.g. drawers, command palettes).

**Behaviour:**
- Captures `document.activeElement` at activation; restores it on cleanup.
- Defers the initial focus move by one `requestAnimationFrame` so the element is fully painted before focus lands.
- Tab/Shift+Tab wrapping queries only visible, non-disabled, non-`inert` focusable descendants.

---

## Manual test results

> Last tested: 2026-06-09

### Keyboard-only

- [x] Tab reaches the close button and any action buttons inside the dialog
- [x] Tab from the last focusable element wraps to the first (close button)
- [x] Shift+Tab from the first focusable element wraps to the last
- [x] Escape closes the dialog — focus returns to the trigger button
- [x] Clicking the close button closes the dialog — focus returns to the trigger
- [x] Clicking the backdrop closes the dialog — focus returns to the trigger
- [x] Clicking inside the dialog panel does not close it
- [x] No keyboard trap — Escape always exits

### Screen reader (NVDA + Firefox)

- [x] Opening the dialog announces: *"Confirm transfer, dialog"* (title via `aria-labelledby` + role)
- [x] `aria-modal="true"` prevents NVDA's virtual cursor from wandering into background content
- [x] When `description` is provided, it is announced as supplementary context on dialog entry
- [x] Close button announced as *"Close dialog, button"*
- [x] Closing the dialog returns the virtual cursor and focus to the trigger element
- [x] Long-content dialog: scrolling within the body does not lose focus or confuse AT

### Zoom / reflow

- [x] Usable at 200% browser zoom — title, body, and action buttons all visible
- [x] At 320 CSS px viewport: dialog fills available width with reduced padding — no horizontal scroll, no content clipped

### Contrast

- [x] Title `#1a1a1a` on white — 18.1:1 ✓
- [x] Body text `#374151` on white — 10.7:1 ✓
- [x] Close button icon `#6b7280` on white — 4.6:1 ✓
- [x] Focus ring `#2563eb` on white — 5.92:1 ✓ (non-text contrast, 1.4.11)

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- Uses a plain `<div>` with no `role="dialog"`, `aria-modal`, or `aria-labelledby` — AT does not recognise the dialog and reads background content (fails **4.1.2**)
- No focus trap — Tab moves focus out of the dialog into the page behind it (fails **2.1.1**)
- Focus is not moved into the dialog on open — keyboard users must Tab forward blind (fails **2.4.3**)
- Focus is not returned to the trigger on close — users lose their place in the page (fails **2.4.3**)
