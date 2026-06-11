# DataTable

A WCAG 2.2 AA–compliant sortable data table for financial-services applications. Uses real `<table>` semantics with `<th scope="col">` headers, `aria-sort` on sortable columns, and a polite live region to announce sort changes without moving focus.

---

## WCAG 2.2 success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **1.3.1 Info and Relationships** | A | Real `<table>` with `<th scope="col">` headers and a visible `<caption>` — row/column relationships are programmatically determinable by AT |
| **1.4.1 Use of Color** | A | Sort direction indicated by icon shape (↑ / ↓ / ↕) alongside the color change — color is never the sole indicator |
| **1.4.3 Contrast (Minimum)** | AA | Header `#374151` on `#f9fafb` = 9.73:1 ✓; active sort `#1d4ed8` = 7.37:1 ✓; body `#374151` on white = 10.7:1 ✓ |
| **1.4.10 Reflow** | AA | Horizontal scroll on narrow viewports; scroll container is keyboard-reachable with `tabIndex={0}` — no content lost at 320 CSS px |
| **2.1.1 Keyboard** | A | Sort controls are real `<button>` elements — reachable and activatable by Tab + Enter/Space |
| **2.4.7 Focus Visible** | AA | Inset `focus-visible` ring on sort buttons; outline on the scroll container when focused |
| **2.5.8 Target Size (Minimum)** | AA | Sort buttons are 44 CSS px tall and fill the full header cell width |
| **4.1.2 Name, Role, Value** | A | `aria-sort="none"` / `"ascending"` / `"descending"` on `<th>` reflects sort state; absent on non-sortable columns |
| **4.1.3 Status Messages** | A | Sort changes announced via a persistent polite `role="status"` live region — e.g. *"Sorted by Amount, ascending"* — without moving focus |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` | Move focus to the next sort button (or the scroll container) |
| `Shift+Tab` | Move focus to the previous sort button |
| `Enter` / `Space` | Activate the focused sort button — toggles ascending → descending |
| Arrow keys | Scroll the table horizontally/vertically when the container has focus |

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `caption` | `string` | — | Visible `<caption>` — the table's accessible name. Required. |
| `columns` | `DataTableColumn[]` | — | Column definitions. Required. |
| `rows` | `DataTableRow[]` | — | Row data. Each row must have a unique `id`. Required. |
| `sortState` | `SortState` | — | Controlled sort: `{ key: string, direction: 'ascending' \| 'descending' }`. When provided, the caller is responsible for sorting `rows`. |
| `onSort` | `(sort: SortState) => void` | — | Called when a sort button is activated. Pair with `sortState` for controlled use, or omit for uncontrolled. |

### `DataTableColumn`

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Matches a property key on `DataTableRow`. |
| `label` | `string` | Visible column heading and accessible name of the sort button. |
| `sortable` | `boolean` | Whether the column is sortable. Defaults to `false`. |
| `align` | `'left' \| 'right' \| 'center'` | Cell alignment. Defaults to `'left'`. |

---

## Controlled vs uncontrolled

**Uncontrolled** (default): omit `sortState` and `onSort`. The table sorts `rows` internally using `String.localeCompare` for strings and numeric comparison for numbers.

**Controlled**: provide both `sortState` and `onSort`. The parent owns sort state and must sort `rows` before passing them in — the table renders them as-is.

---

## Manual test results

> Last tested: 2026-06-09

### Keyboard-only

- [x] Tab reaches each sort button in document order
- [x] Enter and Space activate the focused sort button
- [x] First click on a column sorts ascending; second click sorts descending
- [x] Clicking a different column resets to ascending
- [x] Non-sortable column headers have no button — Tab skips them
- [x] The scroll container (`tabIndex={0}`) is reachable by Tab; arrow keys scroll it

### Screen reader (NVDA + Firefox)

- [x] Table announced as *"Recent transactions, table, 5 rows, 5 columns"*
- [x] Each header announced with `scope="col"` — NVDA reads column association when navigating cells
- [x] Unsorted sortable header: *"Payee, column header, sort button, not sorted"* (`aria-sort="none"`)
- [x] After sorting ascending: *"Amount, column header, sort button, ascending"* (`aria-sort="ascending"`)
- [x] Live region announces *"Sorted by Amount, ascending"* on sort without moving focus
- [x] Live region updates correctly when direction changes to descending
- [x] No announcement on initial render — live region starts empty

### Zoom / reflow

- [x] Usable at 200% browser zoom — all columns and sort buttons visible
- [x] At 320 CSS px viewport: horizontal scroll; scroll container focusable; no content clipped

### Contrast

- [x] Header text `#374151` on `#f9fafb` — 9.73:1 ✓
- [x] Active sort header `#1d4ed8` on `#f9fafb` — 6.93:1 ✓
- [x] Body text `#374151` on white — 10.7:1 ✓
- [x] Focus ring `#2563eb` on white — 5.92:1 ✓ (non-text contrast, 1.4.11)

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- Uses a `<div>` grid with no table semantics — AT announces a flat stream of text with no row/column structure (fails **1.3.1**)
- Sort triggered by a click handler on a `<div>` — not keyboard operable (fails **2.1.1**, **4.1.2**)
- No `aria-sort` — sort direction invisible to AT (fails **4.1.2**)
- Sort direction conveyed by color alone — fails for users with color blindness or high-contrast mode (fails **1.4.1**)
- No live region — sort changes are silent to screen readers (fails **4.1.3**)
