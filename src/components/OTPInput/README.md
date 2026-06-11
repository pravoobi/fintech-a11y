# OTPInput

A WCAG 2.2 AA–compliant one-time passcode input for financial authentication flows.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info and Relationships** | A | Fields grouped in `<fieldset>`/`<legend>`; each input labelled "Digit N of 6" |
| **1.4.1 Use of Color** | A | Error state uses icon + text, not color alone |
| **1.4.3 Contrast (Minimum)** | AA | Error text `#dc2626` on white = 5.74:1 ✓ |
| **1.4.10 Reflow** | AA | Inputs wrap and remain usable at 320 CSS px width |
| **1.4.11 Non-text Contrast** | AA | Error border `#dc2626` on white = 5.74:1 ✓; focus ring `#2563eb` on white = 5.92:1 ✓ |
| **2.1.1 Keyboard** | A | All fields reachable and operable by keyboard only |
| **2.4.7 Focus Visible** | AA | 3px solid outline + border-color change on `:focus-visible` |
| **2.5.8 Target Size (Minimum)** | AA | Each digit box is 48×48 CSS px (minimum is 24×24) |
| **3.3.1 Error Identification** | A | Error text linked to every field via `aria-describedby`; `aria-invalid="true"` set |
| **3.3.2 Labels or Instructions** | A | Persistent `<legend>` label + per-field positional label |
| **3.3.8 Accessible Authentication (Minimum)** | AA | Paste never blocked; `autocomplete="one-time-code"` on first field; no cognitive-function test |
| **4.1.2 Name, Role, Value** | A | Every input has an accessible name, role, and reflects state via `aria-invalid` |
| **4.1.3 Status Messages** | A | Completion announced via `role="status"` polite live region — no focus move |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Move focus into / out of the group |
| `0`–`9` | Enter digit; focus auto-advances to next field |
| `Backspace` | Clear current digit; if empty, move focus to previous field |
| `ArrowLeft` | Move focus to previous field |
| `ArrowRight` | Move focus to next field |
| `Ctrl/Cmd+V` (Paste) | Distribute full code across all fields from position 0 |

---

## Manual test results

> Last tested: 2026-06-04

### Keyboard-only

- [x] Tab reaches the first field; Tab again leaves the group
- [x] Typing digits 1–6 fills fields left to right with focus advancing automatically
- [x] Backspace on an empty field returns focus to the previous field
- [x] ArrowLeft / ArrowRight navigate between fields without data loss
- [x] Pasting a 6-digit code via Ctrl+V fills all fields and moves focus correctly
- [x] No keyboard trap — Tab always exits the group

### Screen reader (NVDA + Firefox)

- [x] Entering the first field announces: *"One-time passcode, group. Digit 1 of 6, edit"*
- [x] Moving between fields announces: *"Digit N of 6, edit"*
- [x] On code completion a polite announcement fires: *"Code complete: 1 2 3 4 5 6. Submitting."* — focus does not move
- [x] Error state: error text is announced immediately on inject (`role="alert"`); focusing any field re-announces the error via `aria-describedby`
- [x] `aria-invalid` state change is announced when error appears

### Zoom / reflow

- [x] Usable at 200% browser zoom — no content clipped
- [x] At 320 CSS px viewport width inputs wrap and remain operable — no horizontal scroll

### Contrast

- [x] Digit text `#1a1a1a` on white — 18.1:1 ✓
- [x] Border `#6b7280` on white — 4.6:1 ✓ (non-text, requires 3:1)
- [x] Focus ring `#2563eb` on white — 5.92:1 ✓
- [x] Error colour `#dc2626` on white — 5.74:1 ✓

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- Has no `<fieldset>`/`<legend>` — fields are ungrouped (fails **1.3.1**)
- Has no `aria-label` per field — screen reader announces nothing useful (fails **1.3.1**, **4.1.2**)
- Uses `autocomplete="off"` — platform OTP autofill disabled (fails **3.3.8**)
- Blocks paste via `e.preventDefault()` — password managers and SMS autofill cannot fill the code (fails **3.3.8**)
- Auto-submits silently with no live region — screen reader users receive no feedback (fails **4.1.3**)
