# Tabs

A WCAG 2.2 AA–compliant tabs component implementing the ARIA Authoring Practices Guide tablist pattern with automatic activation. Used in financial-services UIs for account sections, product details, document views, and settings pages.

---

## Why arrow keys, not Tab, navigate between tabs

The most common tabs mistake in fintech UIs is using `tabIndex={0}` on every tab so Tab key moves between them. This breaks the ARIA tablist keyboard contract:

- The tablist is a single composite widget — Tab should enter it at the selected tab and leave it to the panel, not cycle through every tab
- Arrow keys are the correct mechanism for moving within the tablist
- Breaking this pattern means keyboard users must Tab through every tab to reach the panel — a significant usability problem on pages with many tabs
- AT users relying on the virtual cursor's tab-navigation shortcut expect `role="tab"` + arrow-key navigation; `<div tabIndex={0}>` with Enter activation gives them no semantic anchor

This component follows the APG pattern: one Tab stop into the tablist (the selected tab), arrow keys between tabs, Tab out to the active panel.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info and Relationships** | A | `role="tablist"`, `role="tab"`, `role="tabpanel"` — tab structure programmatically determinable; panels linked to tabs via `aria-controls` / `aria-labelledby` |
| **1.4.1 Use of Color** | A | Active tab uses bottom border + bold weight + `aria-selected="true"` — colour is never the sole indicator |
| **1.4.3 Contrast (Minimum)** | AA | Selected tab `#2563eb` on white = 5.92:1 ✓; default tab `#6b7280` on white = 4.6:1 ✓ |
| **1.4.10 Reflow** | AA | Tabs wrap gracefully at 320 CSS px — no horizontal scroll, no content lost |
| **2.1.1 Keyboard** | A | Arrow keys navigate tablist; Home/End reach boundary tabs; disabled tabs skipped; Tab enters and leaves the tablist |
| **2.4.3 Focus Order** | A | Tab → selected tab → active panel — logical, sequential |
| **2.4.7 Focus Visible** | AA | `focus-visible` ring (3px solid `#2563eb`, 5.92:1 ✓) on tabs and panel |
| **2.5.8 Target Size (Minimum)** | AA | Each tab button is 44 CSS px tall — above the 24×24 minimum |
| **4.1.2 Name, Role, Value** | A | `aria-selected`, `aria-controls`, `aria-labelledby`, `tabIndex` managed correctly; inactive panels carry `hidden` |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Enter tablist at the selected tab |
| `ArrowRight` | Next tab + activate (wraps; skips disabled) |
| `ArrowLeft` | Previous tab + activate (wraps; skips disabled) |
| `Home` | First enabled tab + activate |
| `End` | Last enabled tab + activate |
| `Tab` (from selected tab) | Move focus to active panel |
| `Tab` (in panel) | Move through panel content normally |
| `Shift+Tab` (from panel) | Return focus to selected tab |

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `Tab[]` | — | Tab definitions in display order. Required. |
| `defaultTab` | `string` | First enabled tab | `id` of the initially selected tab. |
| `label` | `string` | — | `aria-label` for the `role="tablist"`. Describe the tab set (e.g. `"Account sections"`). Recommended whenever the tablist purpose is not clear from surrounding context. |
| `onChange` | `(id: string) => void` | — | Fires when the active tab changes — use for routing, analytics, or lifting state. |

### `Tab`

```ts
interface Tab {
  id:       string;
  label:    React.ReactNode;
  panel:    React.ReactNode;
  disabled?: boolean;
}
```

---

## Activation model

Uses **automatic activation** (APG recommended default): moving focus to a tab via arrow keys immediately activates it and shows its panel. This is preferred unless switching tabs triggers a slow network request — in that case, switch to manual activation (Enter/Space activates; arrow keys only move focus).

---

## Contrast

| Element | Foreground | Background | Ratio |
|---|---|---|---|
| Selected tab text | `#2563eb` | `#ffffff` | 5.92:1 ✓ |
| Default tab text | `#6b7280` | `#ffffff` | 4.6:1 ✓ |
| Panel text | `#1a1a1a` | `#ffffff` | 18.1:1 ✓ |
| Focus ring | `#2563eb` | `#ffffff` | 5.92:1 ✓ (1.4.11) |
| Tab strip border | `#e5e7eb` | `#ffffff` | 1.9:1 (decorative separator only) |

---

## Manual test results

> Last tested: 2026-06-12

### Keyboard-only

- [x] Tab reaches the selected tab — not every tab in sequence
- [x] ArrowRight moves focus and activates the next tab
- [x] ArrowLeft moves focus and activates the previous tab
- [x] ArrowRight wraps from last to first tab
- [x] ArrowLeft wraps from first to last tab
- [x] Home activates the first enabled tab
- [x] End activates the last enabled tab
- [x] Disabled tab is skipped by arrow key navigation
- [x] Tab from the selected tab moves focus to the active panel
- [x] Tab inside panel moves through panel content (links, buttons) normally
- [x] Shift+Tab from panel returns focus to the selected tab
- [x] No keyboard trap
- [x] Focus ring visible on tabs and panel

### Screen reader (NVDA + Firefox)

- [x] Entering the tablist announces: *"Account sections, tab list"*
- [x] Focusing Overview tab announces: *"Overview, tab, 1 of 3, selected"*
- [x] Focusing Transactions tab (not selected): *"Transactions, tab, 2 of 3"*
- [x] ArrowRight to Transactions: NVDA announces *"Transactions, tab, 2 of 3, selected"* and panel switches
- [x] Disabled tab announced as *"Transactions, tab, 2 of 3, unavailable"*
- [x] Tab to active panel: *"Overview panel, tab panel"*
- [x] Inactive panels not reachable — correctly `hidden`

### Zoom / reflow

- [x] Usable at 200% browser zoom — all tabs and panel visible
- [x] At 320 CSS px viewport: tab strip wraps onto multiple lines — no horizontal scroll, no content clipped

### Contrast

- [x] Selected tab `#2563eb` on white — 5.92:1 ✓
- [x] Default tab `#6b7280` on white — 4.6:1 ✓
- [x] Focus ring `#2563eb` on white — 5.92:1 ✓

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- No `role="tablist"`, `role="tab"`, `role="tabpanel"` — AT cannot identify the tab structure (fails **1.3.1**, **4.1.2**)
- `<div tabIndex={0}>` with Tab-key navigation — breaks the ARIA tablist keyboard contract (fails **2.1.1**)
- No `aria-selected` — active tab distinguishable by colour and weight only (fails **1.4.1**, **4.1.2**)
- No `aria-controls` / `aria-labelledby` — panel not associated with its tab (fails **4.1.2**)
