# AmountInput

A WCAG 2.2 AA–compliant currency amount input for financial-services applications. Formats values with thousands separators on blur and strips formatting on focus so keyboard editing is never disrupted.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info and Relationships** | A | Currency unit conveyed via a visually-hidden description linked with `aria-describedby` — the visual symbol is `aria-hidden` so AT is not left with a bare number |
| **1.4.1 Use of Color** | A | Error state uses ⚠ icon + text alongside the border change — color is never the sole indicator |
| **1.4.3 Contrast (Minimum)** | AA | Label `#1a1a1a` on white = 18.1:1 ✓; currency symbol / hint `#6b7280` = 4.6:1 ✓; error `#dc2626` = 5.74:1 ✓ |
| **1.4.10 Reflow** | AA | Column layout reflows at 320 CSS px — no horizontal scroll |
| **1.4.11 Non-text Contrast** | AA | Focus ring `#2563eb` = 5.92:1 ✓; error border `#dc2626` = 5.74:1 ✓ |
| **2.1.1 Keyboard** | A | Fully operable by keyboard; format-on-blur never traps or jumps the caret during editing |
| **2.4.7 Focus Visible** | AA | 3px inset solid outline on `:focus-visible` |
| **2.5.8 Target Size (Minimum)** | AA | Input `min-height: 44px` — above the 24×24 CSS px minimum |
| **3.3.1 Error Identification** | A | Error text linked via `aria-describedby`; `aria-invalid="true"` set on the input |
| **3.3.2 Labels or Instructions** | A | Persistent visible `<label>`; placeholder is supplemental only |
| **4.1.2 Name, Role, Value** | A | Accessible name from the label; `aria-invalid` reflects error state |
| **4.1.3 Status Messages** | A | Validation errors announced via persistent polite `role="status"` live region — no focus movement |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Move focus to the input |
| `Shift+Tab` | Move focus away |
| `0`–`9`, `.` | Enter amount digits |
| Blur (`Tab` away) | Formats value — e.g. `1234.5` → `1,234.50` |
| Focus (`Tab` back) | Strips formatting for editing — `1,234.50` → `1234.50` |

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label. Always rendered as a `<label>`. Required. |
| `currencySymbol` | `string` | — | Visual currency symbol (e.g. `$`, `£`, `€`). Rendered `aria-hidden`. |
| `currencyLabel` | `string` | — | Full currency name announced by AT (e.g. `"US dollars"`). Linked via `aria-describedby`. Falls back to `currencySymbol` if omitted. |
| `hint` | `string` | — | Helper text linked via `aria-describedby`. |
| `errorMessage` | `string` | — | Validation error. Sets `aria-invalid`, links via `aria-describedby`, populates the live region. |
| `value` | `number` | — | Controlled numeric value. Displayed formatted when not focused. |
| `onChange` | `(value: number \| undefined) => void` | — | Fires on blur with the parsed numeric value, or `undefined` if the field is empty or unparseable. |
| `required` | `boolean` | `false` | Marks the input required. Visual asterisk is `aria-hidden`. |
| `disabled` | `boolean` | `false` | Disables the input. |
| `placeholder` | `string` | `'0.00'` | Input placeholder text. |

---

## Manual test results

> Last tested: 2026-06-05

### Keyboard-only

- [x] Tab reaches the input from outside the component
- [x] Typing digits and `.` produces the expected raw value during editing
- [x] Tabbing away formats the value (`1234.5` → `1,234.50`) — caret does not jump during typing
- [x] Tabbing back in strips formatting (`1,234.50` → `1234.50`) for clean editing
- [x] Clearing the field and tabbing away results in an empty field and `onChange(undefined)`
- [x] No keyboard trap

### Screen reader (NVDA + Firefox)

- [x] Focusing the input announces: *"Transfer amount, US dollars, edit"* (label + currency description via `aria-describedby` + role)
- [x] Hint text announced after the currency description when present
- [x] Error state: `aria-invalid` change announced; error re-read via `aria-describedby` on focus
- [x] Polite live region announces error on blur without moving focus
- [x] After formatting on blur, re-focusing announces the raw value — no confusion from formatted string

### Zoom / reflow

- [x] Usable at 200% browser zoom — label, symbol, input, hint, and error all visible
- [x] At 320 CSS px viewport: column layout, input fills width — no horizontal scroll

### Contrast

- [x] Label `#1a1a1a` on white — 18.1:1 ✓
- [x] Currency symbol / hint `#6b7280` on white — 4.6:1 ✓
- [x] Input value `#1a1a1a` on white — 18.1:1 ✓
- [x] Error text `#dc2626` on white — 5.74:1 ✓
- [x] Focus ring `#2563eb` on white — 5.92:1 ✓
- [x] Error border `#dc2626` on white — 5.74:1 ✓

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- Uses placeholder as the only label — disappears on input (fails **3.3.2**, **1.3.1**)
- Renders `$` without `aria-hidden` and with no hidden text alternative — AT announces a bare number with no currency unit (fails **1.3.1**)
- Formats on every keystroke — caret jumps to the end on each character typed, making keyboard editing unusable (fails **2.1.1**)
