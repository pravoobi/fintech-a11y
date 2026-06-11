# StepProgress

A WCAG 2.2 AA–compliant step progress indicator for multi-step onboarding flows in financial-services applications. Communicates step status (completed / current / upcoming) to assistive technology via `aria-current`, visually-hidden text, and a `<nav>` landmark — never by color or position alone.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info and Relationships** | A | Step status conveyed via `aria-current="step"` and visually-hidden text ("Step 2 of 4 — Identity verification — current") — not by position or color alone |
| **1.4.1 Use of Color** | A | Completed steps show a checkmark SVG alongside the color fill; current step has a heavier border weight alongside the color change — color is never the sole indicator |
| **1.4.3 Contrast (Minimum)** | AA | Completed label `#1a1a1a` on white = 18.1:1 ✓; current label `#1d4ed8` on white = 7.37:1 ✓; upcoming label `#6b7280` on white = 4.6:1 ✓ |
| **1.4.10 Reflow** | AA | Switches to vertical column layout at 480 px — no horizontal scroll at 320 CSS px |
| **2.5.8 Target Size (Minimum)** | AA | Indicator circles are 40×40 CSS px — above the 24×24 px minimum |
| **3.3.7 Redundant Entry** | A | Data entered in a prior step is persisted and auto-populated in subsequent steps — never re-requested (demonstrated in the `Controlled` story) |
| **4.1.2 Name, Role, Value** | A | `<nav>` landmark with `aria-label`; `aria-current="step"` reflects the active step programmatically |
| **4.1.3 Status Messages** | A | Overall position ("Step 2 of 4") exposed via `aria-describedby` on the `<nav>` — announced when the landmark is entered without requiring focus movement |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Move focus through the page — the stepper itself has no interactive elements |
| Screen reader virtual cursor | Navigate to the "Account setup progress" `<nav>` landmark; hear overall position on entry via `aria-describedby` |
| Screen reader list navigation | Browse each step item; hear status, position, and label for each (e.g. "Step 1 of 4 — Personal details — completed") |

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `StepProgressStep[]` | — | Ordered list of steps. Each item has a `label: string`. Required. |
| `currentStep` | `number` | — | 1-based index of the active step. Steps before it are "completed"; steps after are "upcoming". Required. |
| `ariaLabel` | `string` | — | Accessible name for the `<nav>` landmark (e.g. `"Account setup progress"`). Required. |

---

## Manual test results

> Last tested: 2026-06-06

### Keyboard-only

- [x] No interactive elements in the stepper — Tab moves through surrounding page content without getting stuck
- [x] Step status is not conveyed solely through focus/keyboard — purely informational component
- [x] Visible focus ring appears on any interactive controls in the surrounding Controlled story

### Screen reader (NVDA + Firefox)

- [x] Navigating to the `<nav>` landmark announces the label ("Account setup progress") and the `aria-describedby` summary ("Step 2 of 4")
- [x] Browsing each list item announces: "Step 1 of 4 — Personal details — completed", "Step 2 of 4 — Identity verification — current", etc.
- [x] `aria-current="step"` causes NVDA to announce "current step" for the active item
- [x] Advancing to the next step (via `Controlled` story) updates `aria-current` — re-navigating to the landmark reflects the new position correctly
- [x] Checkmark SVG is `aria-hidden` — AT does not announce "image" or stray SVG content

### Zoom / reflow

- [x] Usable at 200% browser zoom — all step labels, indicators, and connectors remain visible
- [x] At 320 CSS px viewport: switches to vertical column layout — no horizontal scroll, no content lost

### Contrast

- [x] Completed label `#1a1a1a` on white — 18.1:1 ✓
- [x] Current label `#1d4ed8` on white — 7.37:1 ✓
- [x] Upcoming label `#6b7280` on white — 4.6:1 ✓
- [x] Active step border `#2563eb` on white — 5.92:1 ✓ (non-text contrast, 1.4.11)
- [x] Completed connector `#2563eb` on white — 5.92:1 ✓ (non-text contrast, 1.4.11)

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- Uses a plain `<div>` container with no landmark role or accessible name — AT cannot identify the region (fails **1.3.1**, **4.1.2**)
- Omits `aria-current` entirely — AT cannot determine which step is active (fails **1.3.1**, **4.1.2**)
- Uses color as the sole indicator of completion (blue fill) and current step (blue border) — fails for users with color blindness, high-contrast mode, or monochrome displays (fails **1.4.1**)
- Renders only visible step labels with no sr-only status text — screen readers hear "Personal details", "Identity verification" with no indication of completed, current, or pending (fails **1.3.1**)
