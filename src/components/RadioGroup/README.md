# RadioGroup

A WCAG 2.2 AA–compliant radio group for financial-services onboarding flows — account type selection, payment method, transfer frequency, risk appetite. Uses native `<input type="radio">` inside `<fieldset>` + `<legend>` for maximum AT compatibility.

---

## Why native `<input type="radio">`, not ARIA roles

It is possible to build a radio group using `role="radio"` + `role="radiogroup"` on `<div>` elements, but this requires manually implementing all the keyboard behaviour that native inputs provide for free:

- Arrow key navigation between options
- `tabIndex` management (only selected/first in tab order)
- `checked` state propagation
- Form submission and reset
- Browser autofill

Native `<input type="radio">` gets all of this without any JavaScript. The ARIA specification says "use native HTML elements when they exist" — and they do here.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info and Relationships** | A | `<fieldset>` + `<legend>` groups the options; each `<input>` has an associated `<label>` — structure is programmatically determinable |
| **1.4.1 Use of Color** | A | Selected state uses the native radio checked indicator + blue border on the option row — never colour alone |
| **1.4.3 Contrast (Minimum)** | AA | Label text `#1a1a1a` = 18.1:1 ✓; hint `#6b7280` = 4.6:1 ✓; error `#dc2626` = 5.74:1 ✓ |
| **1.4.10 Reflow** | AA | Options wrap gracefully at 320 CSS px — no horizontal scroll, no content lost |
| **2.1.1 Keyboard** | A | Tab enters the group; Arrow keys navigate and select; Tab exits |
| **2.4.7 Focus Visible** | AA | `focus-visible` ring (3px solid `#2563eb`) on each radio input |
| **2.5.8 Target Size (Minimum)** | AA | Each option row is 44 CSS px tall — the entire row is clickable, not just the radio circle |
| **3.3.1 Error Identification** | A | Error linked via `aria-describedby`; `aria-invalid="true"` on all inputs |
| **3.3.2 Labels or Instructions** | A | Persistent visible `<label>` per option; legend provides group context; option hints below each label |
| **4.1.2 Name, Role, Value** | A | `aria-invalid`, `aria-describedby`, `aria-required` on each input |
| **4.1.3 Status Messages** | A | Errors announced via polite `role="status"` live region without focus movement |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Enter group at the selected option (or first if none selected) |
| `ArrowDown` / `ArrowRight` | Next option — wraps to first from last |
| `ArrowUp` / `ArrowLeft` | Previous option — wraps to last from first |
| `Tab` (from any option) | Exit group to the next focusable element |

> Arrow key navigation and selection happen simultaneously (automatic activation) — this is native browser behaviour for radio groups and matches the ARIA APG recommendation.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | — | `<legend>` text — the accessible name for the whole group. Required. |
| `name` | `string` | — | HTML `name` attribute shared by all radio inputs. Required for form submission and correct keyboard grouping. |
| `options` | `RadioOption[]` | — | Options in display order. Required. |
| `value` | `string` | — | Controlled selected value. |
| `onChange` | `(value: string) => void` | — | Fires with the newly selected value. |
| `hint` | `string` | — | Group-level hint below the legend. Linked to all inputs via `aria-describedby`. |
| `errorMessage` | `string` | — | Validation error. Sets `aria-invalid` on all inputs and populates the live region. |
| `required` | `boolean` | `false` | Sets `required` and `aria-required` on all inputs. Visual asterisk is `aria-hidden`. |
| `disabled` | `boolean` | `false` | Disables all inputs. |

### `RadioOption`

```ts
interface RadioOption {
  value:     string;
  label:     string;
  hint?:     string;    // secondary description below the label
  disabled?: boolean;   // disables this individual option
}
```

---

## Full-row click target

The `<label>` element wraps both the `<input>` and the label text, making the entire option row clickable — not just the small radio circle. This is critical for 2.5.8 Target Size: a 16px radio circle is well below the 24×24 minimum, but the full 44px-tall label row exceeds it comfortably.

---

## Contrast

| Element | Foreground | Background | Ratio |
|---|---|---|---|
| Label text | `#1a1a1a` | `#ffffff` | 18.1:1 ✓ |
| Option hint | `#6b7280` | `#ffffff` | 4.6:1 ✓ |
| Error text | `#dc2626` | `#ffffff` | 5.74:1 ✓ |
| Focus ring | `#2563eb` | `#ffffff` | 5.92:1 ✓ (1.4.11) |
| Selected border | `#2563eb` on `#eff6ff` | — | 4.8:1 ✓ (1.4.11) |

---

## Manual test results

> Last tested: 2026-06-12

### Keyboard-only

- [x] Tab reaches the first/selected option; Shift+Tab moves to previous focusable element
- [x] ArrowDown moves to the next option and selects it
- [x] ArrowUp moves to the previous option and selects it
- [x] ArrowDown wraps from last to first option
- [x] ArrowUp wraps from first to last option
- [x] Tab from any option moves to the next focusable element outside the group
- [x] Disabled options are skipped during arrow-key navigation
- [x] Focus ring visible on each radio input
- [x] No keyboard trap

### Screen reader (NVDA + Firefox)

- [x] Entering the group announces: *"Account type, group"*
- [x] Focusing an option announces: *"Personal account, radio button, 1 of 3"* (or "not checked" if unselected)
- [x] Selecting an option announces: *"checked"*
- [x] Option hint read after label via `aria-describedby` association
- [x] Error state: `aria-invalid` announced; error re-read on focus via `aria-describedby`
- [x] Live region announces error on blur without moving focus
- [x] Asterisk (`*`) in legend is not read — correctly `aria-hidden`

### Zoom / reflow

- [x] Usable at 200% browser zoom — legend, labels, and hints all visible
- [x] At 320 CSS px viewport: options stack vertically — no horizontal scroll, no content clipped

### Contrast

- [x] Label text `#1a1a1a` on white — 18.1:1 ✓
- [x] Hint text `#6b7280` on white — 4.6:1 ✓
- [x] Error text `#dc2626` on white — 5.74:1 ✓
- [x] Focus ring `#2563eb` on white — 5.92:1 ✓

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- Plain `<div>` wrapper — no `<fieldset>` or `<legend>` — group purpose not determinable (fails **1.3.1**)
- `<div onClick>` instead of `<input type="radio">` — not keyboard operable, no role, no checked state (fails **2.1.1**, **4.1.2**)
- Selected state by background colour only — no semantic checked indicator (fails **1.4.1**)
- No `aria-describedby` for errors — error cannot be linked to inputs (fails **3.3.1**)
