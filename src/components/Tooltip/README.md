# Tooltip

A WCAG 2.2 AA–compliant tooltip component. Triggered on both hover and keyboard focus. Dismissible with Escape. Hoverable. Used in financial-services UIs to provide supplementary context — sort codes, IBAN formats, fee explanations — without cluttering the visible UI.

---

## Why hover + focus + Escape, not just hover

The most common tooltip failure in fintech UIs is a hover-only implementation:

- Keyboard users focus the trigger and see nothing — any information in the tooltip is lost to them
- Screen reader users relying on AT navigation cannot trigger the tooltip at all
- A non-dismissible tooltip that appears on hover can obscure other content — users must move the pointer to make it go away, which may itself trigger other tooltips

WCAG 1.4.13 (Content on Hover or Focus) mandates three properties for any content that appears on hover or focus. This component satisfies all three:

1. **Dismissible** — Escape hides the tooltip without moving focus
2. **Hoverable** — the pointer can travel from the trigger onto the tooltip without it disappearing (100 ms hide delay)
3. **Persistent** — the tooltip stays visible until the user dismisses it or moves focus/pointer away

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info and Relationships** | A | `role="tooltip"` + `aria-describedby` — supplementary description programmatically associated with trigger |
| **1.4.3 Contrast (Minimum)** | AA | Tooltip text `#ffffff` on `#1a1a1a` = 18.1:1 ✓ |
| **1.4.13 Content on Hover or Focus** | AA | Dismissible (Escape), Hoverable (100 ms delay), Persistent (stays until dismissed) |
| **2.1.1 Keyboard** | A | Tooltip appears on focus; Escape dismisses without moving focus; trigger remains in normal tab order |
| **4.1.2 Name, Role, Value** | A | `role="tooltip"` on bubble; `aria-describedby` on trigger; existing `aria-describedby` values are merged, not overwritten |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Move focus to trigger — tooltip appears |
| `Escape` | Dismiss tooltip — focus stays on trigger |
| `Shift+Tab` | Move focus away — tooltip disappears |

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | — | Tooltip text. Supplementary only — see note below. Required. |
| `children` | `React.ReactElement` | — | A single focusable trigger element. Receives `aria-describedby`. Required. |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Tooltip position relative to the trigger. |
| `maxWidth` | `string` | `'16rem'` | CSS `max-width` of the tooltip bubble. |

---

## Critical rule — tooltips are supplementary only

**Never put critical information exclusively in a tooltip.**

Tooltips are invisible to:
- Touch-device users (no hover state)
- Users who navigate by AT virtual cursor rather than Tab
- Users with cognitive disabilities who may not discover or notice them
- Users who have disabled CSS transitions or animations

If information is required to complete a task (what a field is, what a fee applies, what a limit means), it must appear in the visible label, hint text, or nearby copy — not only in a tooltip.

A tooltip that says "You must maintain £500 to avoid the £12 monthly fee" is inaccessible if that is the only place that information exists.

---

## Tooltip always in the DOM

The tooltip bubble is always rendered in the DOM; visibility is controlled with `visibility: hidden` and `opacity: 0` rather than `display: none`. This is intentional:

- `display: none` prevents AT from resolving `aria-describedby` in some browser/AT combinations
- `visibility: hidden` keeps the element in the layout tree so `aria-describedby` resolution is reliable
- The CSS transition on `opacity` provides a smooth fade without re-mounting the element

---

## Contrast

| Element | Foreground | Background | Ratio |
|---|---|---|---|
| Tooltip text | `#ffffff` | `#1a1a1a` | 18.1:1 ✓ |

---

## Manual test results

> Last tested: 2026-06-12

### Keyboard-only

- [x] Tab reaches the trigger — tooltip appears
- [x] Tooltip content is visible while trigger has focus
- [x] Escape hides the tooltip — focus stays on the trigger
- [x] Shift+Tab moves focus away — tooltip disappears
- [x] No keyboard trap

### Screen reader (NVDA + Firefox)

- [x] Focusing trigger announces: *"What is a sort code?, button, [tooltip text]"* — `aria-describedby` content read after the accessible name
- [x] Tooltip text is not read redundantly as the user navigates past (it is `role="tooltip"`, not a live region)
- [x] Escape dismisses tooltip — no focus movement announced

### Hover / 1.4.13

- [x] Tooltip appears on mouseenter
- [x] Moving pointer from trigger onto tooltip — tooltip stays visible (hoverable, 100 ms delay)
- [x] Moving pointer off wrapper — tooltip disappears after delay
- [x] Escape dismisses tooltip while pointer is over trigger — tooltip goes away

### Contrast

- [x] Tooltip text `#ffffff` on `#1a1a1a` — 18.1:1 ✓

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- Tooltip only on `mouseenter` — keyboard and touch users never see it (fails **2.1.1**, **1.4.13**)
- No `role="tooltip"` — AT does not identify or announce it (fails **4.1.2**)
- No `aria-describedby` — no programmatic association between trigger and tooltip (fails **4.1.2**)
- No Escape handler — tooltip cannot be dismissed without moving the pointer (fails **1.4.13**)
- Critical fee information only in tooltip — material information inaccessible to keyboard and touch users (fails **1.3.1**)
