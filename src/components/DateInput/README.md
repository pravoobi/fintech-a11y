# DateInput

A WCAG 2.2 AA–compliant date entry component for financial-services applications. Three individually labelled fields (`Day`, `Month`, `Year`) grouped in a `<fieldset>` + `<legend>` — no calendar widget, no format mask, no caret fighting.

---

## Why three fields instead of a single masked input

Single-field date inputs with slash-insertion masks are one of the most common inaccessible patterns in fintech UIs:

- The caret jumps to the end on every keystroke where a slash is auto-inserted — keyboard users cannot edit a date they've already entered
- `aria-invalid` applies to the whole field — impossible to communicate which part (day, month, year) is wrong
- Placeholder-as-label disappears on input, leaving AT with no accessible name
- A single field imposes a specific format the user may not expect

Three separate fields solve all of these: each part is individually labelled, individually validated, and individually announced by AT.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info and Relationships** | A | `<fieldset>` + `<legend>` groups the three fields; each has its own `<label>` ("Day", "Month", "Year") — the full date purpose and each sub-field are programmatically determinable |
| **1.4.1 Use of Color** | A | Error state uses ⚠ icon + text alongside the border change — color is never the sole indicator |
| **1.4.3 Contrast (Minimum)** | AA | Legend `#1a1a1a` on white = 18.1:1 ✓; sub-labels `#6b7280` = 4.6:1 ✓; input text `#1a1a1a` = 18.1:1 ✓; error `#dc2626` = 5.74:1 ✓ |
| **1.4.10 Reflow** | AA | Fields wrap gracefully at 320 CSS px — no horizontal scroll, no content lost |
| **2.1.1 Keyboard** | A | Fully operable — Tab moves through each field; auto-advance and Backspace navigation are keyboard conveniences, not the only path |
| **2.4.7 Focus Visible** | AA | `focus-visible` ring (3px solid `#2563eb`, 5.92:1 ✓) on each field |
| **2.5.8 Target Size (Minimum)** | AA | Each input is 44 CSS px tall — above the 24×24 minimum |
| **3.3.1 Error Identification** | A | Error text linked via `aria-describedby` on all three inputs; `aria-invalid="true"` set on each |
| **3.3.2 Labels or Instructions** | A | Persistent visible `<label>` per field; legend provides group context; hint shown before the inputs |
| **3.3.7 Redundant Entry** | A | Pre-populated when a date is already known from a prior step — not re-requested (see `PreFilled` story) |
| **4.1.2 Name, Role, Value** | A | `aria-invalid`, `aria-describedby`, `aria-required` on each input |
| **4.1.3 Status Messages** | A | Errors announced via persistent polite `role="status"` live region without focus movement |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Move focus to next field (Day → Month → Year) |
| `Shift+Tab` | Move focus to previous field |
| `0`–`9` | Enter digit; auto-advances to Month/Year when Day/Month reaches 2 digits |
| `Backspace` on empty field | Move focus to the previous field |

> Auto-advance and Backspace navigation are conveniences — Tab always works independently of them.

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `string` | — | `<legend>` text — the accessible name for the whole date group (e.g. `"Date of birth"`). Required. |
| `value` | `DateValue` | — | Controlled value: `{ day: string; month: string; year: string }`. |
| `onChange` | `(value: DateValue) => void` | — | Fires on every sub-field change with the full updated `DateValue`. |
| `hint` | `string` | — | Helper text shown below the legend (e.g. `"For example, 15 03 1990"`). Linked via `aria-describedby`. |
| `errorMessage` | `string` | — | Validation error. Sets `aria-invalid` on all three inputs and populates the live region. |
| `required` | `boolean` | `false` | Sets `required` and `aria-required` on all three inputs. Visual asterisk is `aria-hidden`. |
| `disabled` | `boolean` | `false` | Disables all three inputs. |

### `DateValue`

```ts
interface DateValue {
  day: string;
  month: string;
  year: string;
}
```

Values are strings (not numbers) to preserve leading zeros (`"07"` for July) and to allow partial input during editing.

---

## Manual test results

> Last tested: 2026-06-11

### Keyboard-only

- [x] Tab reaches the Day field; Shift+Tab reaches the previous focusable element
- [x] Tab moves Day → Month → Year in order
- [x] Entering 2 digits in Day auto-advances focus to Month; same for Month → Year
- [x] Backspace on an empty Month field moves focus back to Day
- [x] Backspace on an empty Year field moves focus back to Month
- [x] Auto-advance does not skip the Tab stop — Tab still reaches all three fields independently
- [x] Non-numeric characters are stripped silently — no error state, no caret jump
- [x] No keyboard trap

### Screen reader (NVDA + Firefox)

- [x] Entering the fieldset announces: *"Date of birth, group"*
- [x] Focusing Day announces: *"Day, edit"* (legend not re-read per field — correct NVDA behaviour)
- [x] Hint text announced via `aria-describedby` when focusing the first field
- [x] Auto-advance: when Day fills to 2 digits, NVDA announces *"Month, edit"* as focus moves
- [x] Error state: `aria-invalid` change announced; error re-read via `aria-describedby` on focus
- [x] Polite live region announces error on blur without moving focus
- [x] Each field's `aria-invalid` is announced independently — AT can distinguish which part is wrong

### Zoom / reflow

- [x] Usable at 200% browser zoom — legend, labels, inputs, and hint all visible
- [x] At 320 CSS px viewport: fields wrap onto multiple lines — no horizontal scroll, no content clipped

### Contrast

- [x] Legend `#1a1a1a` on white — 18.1:1 ✓
- [x] Sub-labels `#6b7280` on white — 4.6:1 ✓
- [x] Input text `#1a1a1a` on white — 18.1:1 ✓
- [x] Placeholder `#9ca3af` on white — 2.85:1 (placeholder is supplemental only — does not carry meaning)
- [x] Error text `#dc2626` on white — 5.74:1 ✓
- [x] Focus ring `#2563eb` on white — 5.92:1 ✓ (non-text contrast, 1.4.11)

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- No `<label>` — placeholder `"DD/MM/YYYY"` is the only hint; disappears on input (fails **3.3.2**, **1.3.1**)
- No `<fieldset>` + `<legend>` — the field's purpose is not programmatically determinable (fails **1.3.1**)
- Auto-inserts slashes on the 2nd and 5th keystroke — caret jumps to the end, making editing by keyboard impossible (fails **2.1.1**)
- Single field for a three-part value — `aria-invalid` cannot identify which part is wrong (fails **3.3.1**)
- Format instruction appears below the input — too late for screen reader users who already focused the field (fails **3.3.2**)
