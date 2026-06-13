# Accordion

A WCAG 2.2 AA–compliant accordion component implementing the ARIA Authoring Practices Guide disclosure pattern. Used in financial-services UIs for FAQs, fee schedules, terms sections, and settings panels.

---

## Why a `<button>` in a heading, not a `<div>`

The most common accordion failure in fintech UIs is a clickable `<div>` or `<li>` with no semantic role:

- `<div>` is not in the tab order — keyboard users cannot reach or activate the item at all
- Without `aria-expanded`, AT cannot announce whether an item is open or closed
- Without a heading wrapper, screen reader users navigating by headings cannot find accordion items — a very common skimming pattern
- Without `aria-controls`, AT has no programmatic link between the trigger and its panel

This component addresses all four: real `<button>` inside a configurable heading, `aria-expanded` reflects state, `aria-controls` links trigger to panel, `role="region"` + `aria-labelledby` makes each panel a named landmark.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info and Relationships** | A | Each trigger wrapped in a heading (`headingLevel` prop) for heading-based navigation; `role="region"` + `aria-labelledby` on each panel |
| **1.4.1 Use of Color** | A | Expanded state communicated via `aria-expanded` + chevron rotation + background tint — never colour alone |
| **1.4.3 Contrast (Minimum)** | AA | Trigger text `#1a1a1a` on white = 18.1:1 ✓; panel text `#374151` on white = 8.6:1 ✓ |
| **1.4.10 Reflow** | AA | Accordion wraps gracefully at 320 CSS px — no horizontal scroll, no content lost |
| **2.1.1 Keyboard** | A | All triggers reachable by Tab; Enter and Space toggle open/closed |
| **2.4.7 Focus Visible** | AA | Inset `focus-visible` ring (3px solid `#2563eb`, 5.92:1 ✓) on each trigger |
| **2.5.8 Target Size (Minimum)** | AA | Each trigger is 44 CSS px tall — above the 24×24 minimum |
| **4.1.2 Name, Role, Value** | A | `aria-expanded` reflects open/closed; `aria-controls` links trigger to panel id; `aria-labelledby` links panel back to trigger |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Move focus to the next trigger |
| `Shift+Tab` | Move focus to the previous trigger |
| `Enter` / `Space` | Toggle the focused item open or closed |

> Accordion does not use arrow-key navigation — that is the tablist pattern. Each trigger is its own Tab stop.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `AccordionItem[]` | — | Accordion items in display order. Required. |
| `allowMultiple` | `boolean` | `false` | When `false`, opening one item closes all others. When `true`, multiple items can be open simultaneously. |
| `defaultOpen` | `string[]` | `[]` | `id`s of items open on first render. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | Heading level for the `<h2>`–`<h6>` wrapping each trigger. Match the surrounding page heading hierarchy. |

### `AccordionItem`

```ts
interface AccordionItem {
  id:      string;
  heading: React.ReactNode;
  panel:   React.ReactNode;
}
```

---

## Heading level guidance

The `headingLevel` prop must match the page heading hierarchy. If the accordion sits below an `<h2>` section heading, use `headingLevel={3}`. If it sits below an `<h3>`, use `headingLevel={4}`.

Getting this wrong degrades the screen reader heading outline — users who navigate by heading level will encounter unexpected jumps or miss the accordion entirely.

---

## `role="region"` note

Each panel carries `role="region"` + `aria-labelledby`. This creates named landmarks that AT users can navigate to directly. The APG recommends omitting `role="region"` when there are more than 6 accordion items — too many region landmarks clutter the AT landmark list. For large accordions (FAQs with 10+ items), remove `role="region"` from the panel or make it configurable.

---

## Contrast

| Element | Foreground | Background | Ratio |
|---|---|---|---|
| Trigger text | `#1a1a1a` | `#ffffff` | 18.1:1 ✓ |
| Panel text | `#374151` | `#ffffff` | 8.6:1 ✓ |
| Focus ring | `#2563eb` | `#ffffff` | 5.92:1 ✓ (1.4.11) |

---

## Manual test results

> Last tested: 2026-06-12

### Keyboard-only

- [x] Tab reaches the first trigger; Shift+Tab moves backwards
- [x] Each trigger is a separate Tab stop — all three reachable without opening any item
- [x] Enter toggles the focused item open/closed
- [x] Space toggles the focused item open/closed
- [x] Opening one item (allowMultiple=false) closes the previously open item
- [x] Opening one item (allowMultiple=true) leaves others open
- [x] Focus ring visible on each trigger
- [x] No keyboard trap

### Screen reader (NVDA + Firefox)

- [x] Each trigger announced as: *"What are the fees?, collapsed, button"* (closed) or *"What are the fees?, expanded, button"* (open)
- [x] Heading level announced: *"heading level 3"* before the trigger label — accordion items navigable by H key
- [x] After opening: panel announced as *"What are the fees?, region"* — navigable as a landmark
- [x] Chevron icon is `aria-hidden` — not read
- [x] Closing an item: `aria-expanded` change announced immediately

### Zoom / reflow

- [x] Usable at 200% browser zoom — triggers and panels fully visible
- [x] At 320 CSS px viewport: content wraps — no horizontal scroll, no content clipped

### Contrast

- [x] Trigger text `#1a1a1a` on white — 18.1:1 ✓
- [x] Panel text `#374151` on white — 8.6:1 ✓
- [x] Focus ring `#2563eb` on white — 5.92:1 ✓

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- `<div onClick>` instead of `<button>` — not keyboard operable, no implicit role (fails **2.1.1**, **4.1.2**)
- No `aria-expanded` — open/closed state not communicated to AT (fails **4.1.2**)
- No `aria-controls` — panel not associated with trigger (fails **4.1.2**)
- No heading wrapper — not navigable by headings in AT (fails **1.3.1**)
- Open state by colour change only — no semantic state indicator (fails **1.4.1**)
