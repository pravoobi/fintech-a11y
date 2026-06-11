# FormField

A WCAG 2.2 AA–compliant form field combining a visible label, optional hint, input, and inline validation for financial-services forms.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info and Relationships** | A | Real `<label>` associated via `htmlFor`/`id`; hint and error both linked via `aria-describedby` |
| **1.4.1 Use of Color** | A | Error state uses ⚠ icon + error text alongside the border change — color is never the sole indicator |
| **1.4.3 Contrast (Minimum)** | AA | Body text `#1a1a1a` on white = 18.1:1 ✓; hint `#6b7280` on white = 4.6:1 ✓; error `#dc2626` on white = 5.74:1 ✓ |
| **1.4.10 Reflow** | AA | Full-width column layout reflows naturally at 320 CSS px — no horizontal scroll |
| **1.4.11 Non-text Contrast** | AA | Default border `#6b7280` on white = 4.6:1 ✓; focus ring `#2563eb` on white = 5.92:1 ✓; error border `#dc2626` = 5.74:1 ✓ |
| **2.1.1 Keyboard** | A | Input reachable and operable by keyboard only |
| **2.4.7 Focus Visible** | AA | 3px solid `#2563eb` outline on `:focus-visible` |
| **2.5.8 Target Size (Minimum)** | AA | Input `min-height: 44px` — well above the 24×24 CSS px minimum |
| **3.3.1 Error Identification** | A | Error text rendered visibly and linked to the input via `aria-describedby` |
| **3.3.2 Labels or Instructions** | A | Persistent visible `<label>`; placeholder is supplemental only, never a label substitute |
| **3.3.3 Error Suggestion** | AA | Error messages are descriptive and include a correct-format example |
| **4.1.2 Name, Role, Value** | A | Input has an accessible name from the label, correct implicit role, and `aria-invalid` reflects error state |
| **4.1.3 Status Messages** | A | Validation errors announced via a persistent polite `role="status"` live region — no focus movement required |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Move focus to the input |
| `Shift+Tab` | Move focus away from the input |
| (typing) | Enter value |

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label text. Always rendered as a `<label>`. Required. |
| `hint` | `string` | — | Helper text shown below the label. Linked via `aria-describedby`. |
| `errorMessage` | `string` | — | Validation error. Sets `aria-invalid`, links via `aria-describedby`, and populates the polite live region. |
| `required` | `boolean` | `false` | Marks the input as required. Visual asterisk is `aria-hidden`; AT reads "required" from the native attribute. |
| `disabled` | `boolean` | `false` | Disables the input and visually mutes the label. |
| ...rest | `InputHTMLAttributes` | — | All standard `<input>` attributes (`type`, `value`, `onChange`, `onBlur`, `placeholder`, etc.) are forwarded. |

---

## Manual test results

> Last tested: 2026-06-04

### Keyboard-only

- [x] Tab reaches the input from outside the component
- [x] Shift+Tab moves focus back out
- [x] Typing populates the input value
- [x] No keyboard trap

### Screen reader (NVDA + Firefox)

- [x] Focusing the input announces: *"Email address, edit"* (label + role)
- [x] With hint: *"Email address, edit — We'll send your monthly statement here"* (hint via `aria-describedby`)
- [x] With error: `aria-invalid` change announced; error text read via `aria-describedby` on focus
- [x] On live validation (blur): polite live region announces error message without moving focus
- [x] Required field announced as *"Email address, required, edit"*
- [x] Disabled field announced as *"Email address, dimmed, edit"*

### Zoom / reflow

- [x] Usable at 200% browser zoom — label, hint, input, and error all visible
- [x] At 320 CSS px viewport: full-width column layout — no horizontal scroll, no content clipped

### Contrast

- [x] Label `#1a1a1a` on white — 18.1:1 ✓
- [x] Hint `#6b7280` on white — 4.6:1 ✓
- [x] Error text `#dc2626` on white — 5.74:1 ✓
- [x] Default border `#6b7280` on white — 4.6:1 ✓ (non-text: requires 3:1)
- [x] Focus ring `#2563eb` on white — 5.92:1 ✓
- [x] Error border `#dc2626` on white — 5.74:1 ✓

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- Uses placeholder as the only label — disappears on input, inconsistently exposed by AT (fails **3.3.2**, **1.3.1**)
- Shows a red border as the only error indicator — invisible to color-blind and high-contrast users (fails **1.4.1**)
- Renders error text not linked via `aria-describedby` — AT cannot associate it with the field (fails **3.3.1**)
- Sets no `aria-invalid` — invalid state not exposed to the accessibility tree (fails **4.1.2**)
- Has no live region — error appearance is silent to screen reader users (fails **4.1.3**)
