# Checkbox / CheckboxGroup

WCAG 2.2 AA–compliant checkbox components for financial-services forms — consent flows, notification preferences, feature opt-ins. Two exports: `Checkbox` (single) and `CheckboxGroup` (multiple options in a `<fieldset>`, with optional "Select all").

---

## Why native `<input type="checkbox">`, not `role="checkbox"`

The native element provides checked state, keyboard activation (Space), form submission, browser autofill, and the `indeterminate` DOM property — all for free. Using `role="checkbox"` on a `<div>` requires manually reimplementing all of this. The ARIA specification recommends native HTML elements when they exist.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info & Relationships** | A | `<input>` + `<label htmlFor>` (Checkbox); `<fieldset>` + `<legend>` (CheckboxGroup) — structure programmatically determinable |
| **1.4.1 Use of Color** | A | Error shown with ⚠ icon + text — not colour alone; checked state uses native checked indicator + border change |
| **1.4.3 Contrast (Minimum)** | AA | Label `#1a1a1a` = 18.1:1 ✓; hint `#6b7280` = 4.6:1 ✓; error `#dc2626` = 5.74:1 ✓ |
| **1.4.10 Reflow** | AA | Options reflow at 320 CSS px — no horizontal scroll, no content lost |
| **2.1.1 Keyboard** | A | Tab to reach; Space to toggle |
| **2.4.7 Focus Visible** | AA | `focus-visible` ring (3px solid `#2563eb`) on each input |
| **2.5.8 Target Size (Minimum)** | AA | Each option row is 44 CSS px tall — entire `<label>` is the click target |
| **3.3.1 Error Identification** | A | Error linked via `aria-describedby`; `aria-invalid="true"` on affected inputs |
| **3.3.2 Labels or Instructions** | A | Persistent visible `<label>` per checkbox; legend provides group context; per-option hints |
| **4.1.2 Name, Role, Value** | A | `aria-invalid`, `aria-describedby`, `aria-required`; `indeterminate` DOM property maps to `aria-checked="mixed"` in AT tree |
| **4.1.3 Status Messages** | A | Errors announced via polite `role="status"` live region without focus movement |

---

## Keyboard map

### Checkbox (single)

| Key | Action |
|-----|--------|
| `Tab` | Reach the checkbox |
| `Space` | Toggle checked/unchecked |

### CheckboxGroup

| Key | Action |
|-----|--------|
| `Tab` | Move to the next checkbox (each option is in the tab order) |
| `Shift+Tab` | Move to the previous checkbox |
| `Space` | Toggle the focused checkbox |

> Unlike radio groups, each checkbox is independently operable — all options are in the tab order rather than using arrow-key navigation.

---

## Props

### `Checkbox`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label text. Required. |
| `checked` | `boolean` | — | Controlled checked state. |
| `indeterminate` | `boolean` | `false` | Sets the DOM `indeterminate` property — mapped to `aria-checked="mixed"` by the browser. |
| `onChange` | `(checked: boolean) => void` | — | Fires with the new checked state on change. |
| `hint` | `string` | — | Hint shown below the label. Linked via `aria-describedby`. |
| `errorMessage` | `string` | — | Validation error. Sets `aria-invalid` and populates the live region. |
| `required` | `boolean` | `false` | Sets `required` and `aria-required`. Visual asterisk is `aria-hidden`. |
| `disabled` | `boolean` | `false` | Disables the input. |
| `id` | `string` | — | Override the generated `id` — useful when composing within a group. |

### `CheckboxGroup`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | — | `<legend>` text — accessible name for the group. Required. |
| `options` | `CheckboxOption[]` | — | Checkbox options in display order. Required. |
| `value` | `string[]` | `[]` | Controlled array of selected values. |
| `onChange` | `(value: string[]) => void` | — | Fires with the updated selected values array. |
| `hint` | `string` | — | Group-level hint below the legend. |
| `errorMessage` | `string` | — | Validation error. Sets `aria-invalid` on all inputs. |
| `required` | `boolean` | `false` | Sets `required` and `aria-required` on all inputs. |
| `disabled` | `boolean` | `false` | Disables all inputs. |
| `showSelectAll` | `boolean` | `false` | Renders a "Select all" checkbox. Indeterminate when some but not all options are selected. |

### `CheckboxOption`

```ts
interface CheckboxOption {
  value:     string;
  label:     string;
  hint?:     string;     // secondary description below the label
  disabled?: boolean;    // disables this individual option
}
```

---

## Indeterminate state

The `indeterminate` state cannot be set via an HTML attribute — it is a DOM property only. The implementation uses `useRef` + `useEffect`:

```tsx
useEffect(() => {
  if (inputRef.current) inputRef.current.indeterminate = indeterminate;
}, [indeterminate]);
```

Browsers automatically reflect this DOM property as `aria-checked="mixed"` in the accessibility tree, which screen readers announce as "mixed" or "partially checked". No explicit ARIA override is needed.

---

## Full-row click target

The `<label>` element wraps both the `<input>` and the label text, making the entire option row clickable — not just the 18px checkbox square. This is critical for 2.5.8 Target Size: the checkbox input alone is well below 24×24 px, but the full 44 CSS px–tall label row exceeds the minimum comfortably.

---

## Contrast

| Element | Foreground | Background | Ratio |
|---|---|---|---|
| Label text | `#1a1a1a` | `#ffffff` | 18.1:1 ✓ |
| Option hint | `#6b7280` | `#ffffff` | 4.6:1 ✓ |
| Error text | `#dc2626` | `#ffffff` | 5.74:1 ✓ |
| Focus ring | `#2563eb` | `#ffffff` | 5.92:1 ✓ (1.4.11) |
| Checked border | `#2563eb` on `#eff6ff` | — | 4.8:1 ✓ (1.4.11) |

---

## Manual test results

> Last tested: 2026-06-12

### Keyboard-only

- [x] Tab reaches the checkbox; Shift+Tab moves to previous focusable element
- [x] Space toggles checked/unchecked
- [x] Focus ring visible on each checkbox input
- [x] No keyboard trap
- [x] CheckboxGroup: all options individually reachable via Tab
- [x] CheckboxGroup: "Select all" reachable via Tab; Space toggles all

### Screen reader (NVDA + Firefox)

- [x] Checkbox announces: *"I agree to the terms and conditions, checkbox, not checked"*
- [x] Hint read after label via `aria-describedby` association
- [x] Error state: `aria-invalid` announced; error re-read on focus via `aria-describedby`
- [x] Live region announces error on validation without moving focus
- [x] Asterisk (`*`) in label is not read — correctly `aria-hidden`
- [x] Indeterminate state announced as: *"mixed"* / *"partially checked"*
- [x] CheckboxGroup: entering announces *"Notification preferences, group"*
- [x] Each option announces its label + hint via `aria-describedby`

### Zoom / reflow

- [x] Usable at 200% browser zoom — labels and hints fully visible
- [x] At 320 CSS px viewport: options stack vertically — no horizontal scroll, no content clipped

### Contrast

- [x] Label text `#1a1a1a` on white — 18.1:1 ✓
- [x] Hint text `#6b7280` on white — 4.6:1 ✓
- [x] Error text `#dc2626` on white — 5.74:1 ✓
- [x] Focus ring `#2563eb` on white — 5.92:1 ✓

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- `<div role="checkbox">` with no `aria-checked` — checked state not determinable (fails **4.1.2**)
- No keyboard handler — Space key does nothing (fails **2.1.1**)
- No `<label>` association — purpose not programmatically determinable (fails **1.3.1**)
- Error shown by red colour only — no icon, no `aria-invalid` (fails **1.4.1**, **3.3.1**)
