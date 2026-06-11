# PasswordInput

A WCAG 2.2 AA–compliant password input with a show/hide toggle for financial-services login and registration forms.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info and Relationships** | A | Real `<label>` associated via `htmlFor`/`id`; hint and error linked via `aria-describedby` |
| **1.4.1 Use of Color** | A | Error state uses ⚠ icon + text alongside the border change — color is never the sole indicator |
| **1.4.3 Contrast (Minimum)** | AA | Label `#1a1a1a` on white = 18.1:1 ✓; hint `#6b7280` = 4.6:1 ✓; toggle `#2563eb` = 5.92:1 ✓; error `#dc2626` = 5.74:1 ✓ |
| **1.4.10 Reflow** | AA | Column layout reflows at 320 CSS px; input shrinks, toggle remains operable |
| **1.4.11 Non-text Contrast** | AA | Focus ring `#2563eb` = 5.92:1 ✓; error border `#dc2626` = 5.74:1 ✓ |
| **2.1.1 Keyboard** | A | Input and toggle button both reachable and operable by keyboard only |
| **2.4.7 Focus Visible** | AA | 3px solid outline on `:focus-visible` for input; inset outline for toggle; focus never lost or moved unexpectedly after toggle activation |
| **2.5.3 Label in Name** | A | Toggle visible text ("Show password" / "Hide password") is the full accessible name — no mismatch |
| **2.5.8 Target Size (Minimum)** | AA | Toggle button 44×44 CSS px — above the 24×24 minimum |
| **3.3.1 Error Identification** | A | Error text linked to input via `aria-describedby`; `aria-invalid="true"` set |
| **3.3.2 Labels or Instructions** | A | Persistent visible `<label>`; placeholder is supplemental only |
| **3.3.8 Accessible Authentication (Minimum)** | AA | Paste never blocked; `autocomplete="current-password"` / `"new-password"` enables password-manager autofill; no cognitive-function test |
| **4.1.2 Name, Role, Value** | A | Toggle is `<button type="button">` with `aria-pressed` reflecting shown/hidden state |
| **4.1.3 Status Messages** | A | Validation errors announced via persistent polite `role="status"` live region — no focus movement |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Move focus to input, then to toggle button |
| `Shift+Tab` | Move focus in reverse |
| `Enter` | Activate the toggle (show or hide password) |
| `Space` | Activate the toggle (show or hide password) |
| `Ctrl/Cmd+V` | Paste into the input — never blocked |

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label. Always rendered as a `<label>`. Required. |
| `hint` | `string` | — | Helper text linked via `aria-describedby`. |
| `errorMessage` | `string` | — | Validation error. Sets `aria-invalid`, links via `aria-describedby`, populates the live region. |
| `autoComplete` | `'current-password' \| 'new-password'` | `'current-password'` | Maps to the input's `autocomplete` attribute. Use `new-password` on registration and change-password forms. |
| `required` | `boolean` | `false` | Marks the input as required. Visual asterisk is `aria-hidden`. |
| `disabled` | `boolean` | `false` | Disables both the input and the toggle button. |
| ...rest | `InputHTMLAttributes` | — | All standard `<input>` attributes forwarded except `id` and `type`. |

---

## Manual test results

> Last tested: 2026-06-05

### Keyboard-only

- [x] Tab reaches the input from outside the component
- [x] Tab from the input moves focus to the toggle button
- [x] Enter and Space activate the toggle — input type switches password ↔ text
- [x] Focus stays on the toggle button after activation — does not jump to input or disappear
- [x] Shift+Tab reverses the focus order correctly
- [x] No keyboard trap

### Screen reader (NVDA + Firefox)

- [x] Focusing the input announces: *"Password, edit, protected"* (label + role + type=password state)
- [x] After toggle: announces *"Password, edit"* (type=text loses "protected" indicator)
- [x] Focusing the toggle announces: *"Show password, button, not pressed"*
- [x] After activation: *"Hide password, button, pressed"* — `aria-pressed` change announced
- [x] With hint: hint text announced via `aria-describedby` after the label
- [x] Error state: `aria-invalid` change announced; error re-read via `aria-describedby` on focus
- [x] Live validation: polite live region announces error on blur without moving focus

### Zoom / reflow

- [x] Usable at 200% browser zoom — label, input, toggle, and error all visible
- [x] At 320 CSS px viewport: column layout, input and toggle remain side by side and operable

### Contrast

- [x] Label `#1a1a1a` on white — 18.1:1 ✓
- [x] Hint `#6b7280` on white — 4.6:1 ✓
- [x] Toggle text `#2563eb` on white — 5.92:1 ✓
- [x] Error text `#dc2626` on white — 5.74:1 ✓
- [x] Focus ring `#2563eb` on white — 5.92:1 ✓
- [x] Error border `#dc2626` on white — 5.74:1 ✓

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- Uses placeholder as the only label — disappears on input, inconsistently exposed by AT (fails **3.3.2**, **1.3.1**)
- Toggle is a `<div>` not a `<button>` — not in the tab order, cannot be keyboard activated (fails **2.1.1**, **4.1.2**)
- Toggle has an emoji only, no accessible name — AT announces it inconsistently or not at all (fails **2.5.3**, **4.1.2**)
- No `aria-pressed` — shown/hidden state not exposed to the accessibility tree (fails **4.1.2**)
- Focus moved to input after toggle — keyboard users lose their position (fails **2.4.7**)
- Paste blocked via `onPaste` — password managers cannot autofill (fails **3.3.8**)
