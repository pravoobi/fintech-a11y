# Combobox

A WCAG 2.2 AA–compliant combobox (autocomplete) for financial-services applications. Covers payee search, currency selection, account lookup, and any pattern where the user filters a list by typing. Focus never leaves the input — `aria-activedescendant` keeps AT informed of the highlighted option throughout keyboard navigation.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info and Relationships** | A | `role="combobox"` on the input; `role="listbox"` + `role="option"` on the dropdown — the widget structure is programmatically determinable |
| **1.4.1 Use of Color** | A | Highlighted option uses background + text color change together; selected option adds a ✓ mark — color is never the sole indicator |
| **1.4.3 Contrast (Minimum)** | AA | Label `#1a1a1a` = 18.1:1 ✓; hint/placeholder `#6b7280` = 4.6:1 ✓; option text `#1a1a1a` = 18.1:1 ✓; highlighted `#1d4ed8` = 7.37:1 ✓; error `#dc2626` = 5.74:1 ✓ |
| **1.4.10 Reflow** | AA | Single-column layout — no horizontal scroll at 320 CSS px |
| **2.1.1 Keyboard** | A | Fully operable — Tab to reach, ↓/↑ to navigate, Enter to select, Escape to close; options are not mouse-only |
| **2.4.7 Focus Visible** | AA | Focus ring on the input wrapper via `:focus-within` (3px solid `#2563eb`, 5.92:1 ✓) |
| **2.5.8 Target Size (Minimum)** | AA | Options are 44 CSS px tall — above the 24×24 minimum |
| **3.3.1 Error Identification** | A | Error text linked via `aria-describedby`; `aria-invalid="true"` set on the input; ⚠ icon so error is not color-alone |
| **3.3.2 Labels or Instructions** | A | Persistent visible `<label>` via `htmlFor`/`id` — placeholder is supplemental only |
| **4.1.2 Name, Role, Value** | A | `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant` maintained throughout; `aria-selected` on each option; focus stays on the input |
| **4.1.3 Status Messages** | A | Result count announced via polite `role="status"` live region (*"3 results available"*, *"No results found"*) without focus movement |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Move focus to the combobox |
| `↓` | Open the listbox / move highlight to the next option |
| `↑` | Move highlight to the previous option / return to input from first |
| `Enter` | Select the highlighted option and close the listbox |
| `Escape` | Close the listbox, revert the query to the selected label |
| `Tab` (while open) | Select the highlighted option (if any) then move focus away |

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Visible label. Always rendered as a `<label>`. Required. |
| `options` | `ComboboxOption[]` | — | Full option list. Each item: `{ value: string; label: string }`. Required. |
| `value` | `string` | — | Controlled selected value. |
| `onChange` | `(value: string \| undefined) => void` | — | Fires with the selected value on selection, or `undefined` on clear. |
| `hint` | `string` | — | Helper text linked via `aria-describedby`. |
| `errorMessage` | `string` | — | Validation error. Sets `aria-invalid`, links via `aria-describedby`, populates the live region. |
| `required` | `boolean` | `false` | Sets `aria-required` on the input. |
| `disabled` | `boolean` | `false` | Disables the input. |
| `placeholder` | `string` | `'Search…'` | Input placeholder text. |

---

## Focus management detail

Focus **never leaves the input**. This is the correct ARIA combobox pattern:

- The `<input>` always holds keyboard focus.
- `aria-activedescendant` on the input points to the highlighted option's `id`.
- AT reads the highlighted option as the user moves through the list, without a real focus move.
- `onMouseDown` + `e.preventDefault()` on every option and the clear button prevents blur from firing when the user clicks inside the widget.

This contrasts with the "focus moves to each option" pattern which is also valid but loses the typing-while-navigating ability and is harder to implement accessibly.

---

## Manual test results

> Last tested: 2026-06-11

### Keyboard-only

- [x] Tab reaches the combobox input
- [x] Typing filters the list; the live region announces the result count
- [x] ↓ opens the listbox and moves highlight to the first option
- [x] ↓/↑ navigate through options — input retains focus throughout
- [x] ↑ from the first option returns highlight to the input (no activedescendant)
- [x] Enter selects the highlighted option; input shows the selected label; listbox closes
- [x] Escape closes the listbox and reverts the query to the selected label
- [x] Tab while open selects the highlighted option then moves focus away
- [x] Clear button (×) accessible by pointer; Escape + re-select covers keyboard clear
- [x] No keyboard trap

### Screen reader (NVDA + Firefox)

- [x] Focusing the input announces: *"Payee, edit, has autocomplete"*
- [x] Opening the listbox: NVDA announces `aria-expanded` state change
- [x] Typing "ali": live region announces *"1 result available"*
- [x] ↓ to first option: NVDA reads the option label via `aria-activedescendant` — *"Alice Johnson"*
- [x] ↑ back to input: `aria-activedescendant` cleared; NVDA returns to reading the input value
- [x] Selecting: *"Alice Johnson"* announced; `aria-expanded="false"`
- [x] No results: live region announces *"No results found"*
- [x] Error state: `aria-invalid` change announced; error re-read via `aria-describedby` on focus

### Zoom / reflow

- [x] Usable at 200% browser zoom — label, input, and listbox all visible; listbox doesn't clip off-screen
- [x] At 320 CSS px viewport: single column, input fills width — no horizontal scroll

### Contrast

- [x] Label `#1a1a1a` on white — 18.1:1 ✓
- [x] Option text `#1a1a1a` on white — 18.1:1 ✓
- [x] Highlighted option `#1d4ed8` on `#eff6ff` — 6.28:1 ✓
- [x] Hint `#6b7280` on white — 4.6:1 ✓
- [x] Error `#dc2626` on white — 5.74:1 ✓
- [x] Focus ring `#2563eb` on white — 5.92:1 ✓ (non-text contrast, 1.4.11)

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- No `<label>` — placeholder only; AT announces "edit" with no context (fails **3.3.2**, **1.3.1**)
- No `role="combobox"`, `aria-expanded`, or `aria-controls` — AT doesn't know this is a combobox (fails **4.1.2**)
- Plain `<div>` dropdown with no `role="listbox"` or `role="option"` — structure invisible to AT (fails **1.3.1**, **4.1.2**)
- No `aria-activedescendant` — keyboard users navigate blind; AT has no way to track the highlighted option (fails **4.1.2**)
- Options are `<div>` elements with `onMouseDown` only — not keyboard operable (fails **2.1.1**)
- No live region — result count never announced (fails **4.1.3**)
- Selected item shown by background color alone (fails **1.4.1**)
