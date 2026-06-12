# Pagination

A WCAG 2.2 AA–compliant pagination component for financial-services UIs — transaction lists, statement history, search results. Page position is communicated to all users via landmark, `aria-current`, and a live region — never by colour or position alone.

---

## Why `aria-current="page"` + live region, not just visual styling

The most common pagination failure in fintech is an active page that is only distinguishable by a coloured background:

- A keyboard user tabbing through buttons has no way to know which page is current without `aria-current="page"`
- A screen reader user jumping to the next page hears nothing — there is no announcement unless a live region is updated
- Colour-only active state fails 1.4.1 for users who cannot perceive colour differences
- A plain `<div>` wrapper with no `<nav>` landmark means the pagination cannot be found by landmark navigation

This component addresses all four with: `<nav aria-label>`, `aria-current="page"`, `aria-label="Page N"` on every button, and a polite `role="status"` live region.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info and Relationships** | A | `<nav>` landmark with `aria-label`; page position via `aria-current="page"` and live region — programmatically determinable |
| **1.4.1 Use of Color** | A | Active page uses filled background + bold weight + `aria-current` — colour is never the sole indicator |
| **1.4.3 Contrast (Minimum)** | AA | Active: `#ffffff` on `#2563eb` = 5.92:1 ✓; default text `#1a1a1a` on `#ffffff` = 18.1:1 ✓ |
| **1.4.10 Reflow** | AA | Buttons wrap gracefully at 320 CSS px — no horizontal scroll, no content lost |
| **2.1.1 Keyboard** | A | All enabled controls reachable by Tab, activated by Enter or Space; disabled buttons removed from tab order |
| **2.4.7 Focus Visible** | AA | `focus-visible` ring (3px solid `#2563eb`, 5.92:1 ✓) on every button |
| **2.5.8 Target Size (Minimum)** | AA | Every button is 44×44 CSS px — above the 24×24 minimum |
| **4.1.2 Name, Role, Value** | A | Each page button has `aria-label="Page N"`; active page has `aria-current="page"`; previous/next have descriptive labels; disabled state exposed via `disabled` attribute |
| **4.1.3 Status Messages** | A | Polite `role="status"` live region announces "Page N of T" on every change without moving focus |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Move focus through enabled page controls (disabled buttons skipped) |
| `Shift+Tab` | Move focus to previous enabled control |
| `Enter` / `Space` | Activate focused button |

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentPage` | `number` | — | Currently active page (1-based). Required. |
| `totalPages` | `number` | — | Total number of pages. Required. |
| `onPageChange` | `(page: number) => void` | — | Fires when the user selects a different page. Required. |
| `siblingCount` | `number` | `1` | Pages shown on each side of the current page before an ellipsis appears. |
| `navigationLabel` | `string` | `"Pagination"` | Accessible label for the `<nav>` landmark — use a descriptive value when multiple navigations exist on the page (e.g. `"Transaction history pages"`). |

---

## Page range algorithm

| Example | Output |
|---|---|
| Page 1 of 10, siblings 1 | `[1] [2] … [10]` |
| Page 5 of 10, siblings 1 | `[1] … [4] [5] [6] … [10]` |
| Page 9 of 10, siblings 1 | `[1] … [9] [10]` |
| Page 3 of 5, siblings 1 | `[1] [2] [3] [4] [5]` (no ellipsis) |
| Page 10 of 20, siblings 2 | `[1] … [8] [9] [10] [11] [12] … [20]` |

First and last pages are always rendered. Ellipsis spans are `aria-hidden="true"` — they carry no information for AT.

---

## Contrast

| Element | Foreground | Background | Ratio |
|---|---|---|---|
| Default button text | `#1a1a1a` | `#ffffff` | 18.1:1 ✓ |
| Active page text | `#ffffff` | `#2563eb` | 5.92:1 ✓ |
| Arrow button text | `#374151` | `#ffffff` | 10.7:1 ✓ |
| Ellipsis text | `#6b7280` | `#ffffff` | 4.6:1 ✓ |
| Focus ring | `#2563eb` | `#ffffff` | 5.92:1 ✓ (1.4.11) |

---

## Manual test results

> Last tested: 2026-06-12

### Keyboard-only

- [x] Tab reaches the first enabled button; Shift+Tab moves backwards
- [x] Previous button is skipped by Tab when disabled (page 1)
- [x] Next button is skipped by Tab when disabled (last page)
- [x] Enter and Space activate any focused button
- [x] Ellipsis spans are not in the tab order
- [x] No keyboard trap
- [x] Focus ring visible on every enabled button

### Screen reader (NVDA + Firefox)

- [x] Nav announced as "Pagination, navigation" on entry
- [x] Active page announced as "Page 5, button, current page" (NVDA wording)
- [x] Inactive pages announced as "Page 3, button"
- [x] Previous page announced as "Previous page, button" (disabled: "Previous page, button, dimmed")
- [x] Next page announced as "Next page, button"
- [x] Ellipsis spans not read — correctly `aria-hidden`
- [x] After clicking Page 7: live region announces "Page 7 of 10" politely without interrupting
- [x] Custom `navigationLabel` read correctly on entry

### Zoom / reflow

- [x] Usable at 200% browser zoom — all buttons visible and operable
- [x] At 320 CSS px viewport: buttons wrap onto multiple lines — no horizontal scroll, no content clipped

### Contrast

- [x] Active page `#ffffff` on `#2563eb` — 5.92:1 ✓
- [x] Default text `#1a1a1a` on `#ffffff` — 18.1:1 ✓
- [x] Focus ring `#2563eb` on `#ffffff` — 5.92:1 ✓

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- Plain `<div>` wrapper — no `<nav>` landmark, not findable by landmark navigation (fails **1.3.1**)
- `<span onClick>` for all controls — not keyboard operable, no role, no accessible name (fails **2.1.1**, **4.1.2**)
- Active page shown by background colour only — no `aria-current`, no font-weight change (fails **1.4.1**, **4.1.2**)
- No live region — page change never announced to AT (fails **4.1.3**)
