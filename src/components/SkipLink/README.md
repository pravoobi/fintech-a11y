# SkipLink

A "Skip to main content" link — the first focusable element on every page. Visually hidden until focused, then slides into view so sighted keyboard users can see and activate it.

---

## Why every page needs this

Without a skip link, keyboard users must Tab through every repeated element on the page — site header, navigation, breadcrumb, secondary nav — before reaching the main content. On a typical fintech dashboard this is 15–30 Tab presses on every single page load.

The skip link provides a single keypress mechanism to bypass all of it. It is one of the simplest components to implement and one of the highest-impact accessibility improvements available.

WCAG 2.4.1 Bypass Blocks is Level A — the baseline. It is non-negotiable.

---

## WCAG success criteria satisfied

| Criterion | Level | How |
|---|---|---|
| **2.4.1 Bypass Blocks** | A | Provides a visible, keyboard-operable link as the first focusable element that jumps focus to `<main>`, bypassing repeated navigation |
| **2.4.7 Focus Visible** | AA | Link slides into view on `:focus-visible` — clearly visible to sighted keyboard users |
| **1.4.3 Contrast (Minimum)** | AA | Link text `#ffffff` on `#1d4ed8` = 7.2:1 ✓ |

---

## Keyboard map

| Key | Action |
|-----|--------|
| `Tab` (first press on page) | Reveals the skip link at the top of the viewport |
| `Enter` | Activates the link — focus moves to the target element |
| `Tab` (after activation) | Moves through main content, bypassing navigation |

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `targetId` | `string` | `"main-content"` | The `id` of the element to skip to. Must match a `tabIndex={-1}` element on the page. |
| `label` | `string` | `"Skip to main content"` | Visible link text shown when focused. |

---

## Integration

Place `<SkipLink />` as the **very first element** inside `<body>`, before the site header and navigation:

```tsx
// _app.tsx / RootLayout / page shell
<body>
  <SkipLink />
  <header>
    <nav>…five nav links…</nav>
  </header>
  <main id="main-content" tabIndex={-1}>
    {children}
  </main>
</body>
```

### `tabIndex={-1}` on the target is required

Without `tabIndex={-1}` on the target element, activating the skip link scrolls the viewport to the anchor but **leaves focus on the link**. The next Tab press lands on the first nav item — the skip link does nothing useful.

`tabIndex={-1}` makes the element programmatically focusable (it does not add it to the natural tab order). The browser moves focus there when the skip link is activated.

```tsx
// ✓ Correct
<main id="main-content" tabIndex={-1}>…</main>

// ✗ Broken — focus doesn't move, next Tab goes back to nav
<main id="main-content">…</main>
```

### Multiple skip links

On pages with long sidebars or secondary navigation, multiple skip links are valid:

```tsx
<SkipLink label="Skip to main content"     targetId="main-content" />
<SkipLink label="Skip to account summary"  targetId="account-summary" />
```

Each must still be near the top of the page and each target must have `tabIndex={-1}`.

---

## Why `transform` not `display:none`

The hidden state uses `transform: translateY(-100%)` to move the link off the top of the viewport — not `display:none` or `visibility:hidden`. This is intentional:

- `display:none` removes the element from the tab order — a keyboard user can never Tab to it, defeating the entire purpose
- `visibility:hidden` also removes it from the tab order in most browsers
- `transform` keeps the element focusable while keeping it out of the visible viewport until needed

---

## Contrast

| Element | Foreground | Background | Ratio |
|---|---|---|---|
| Link text (focused) | `#ffffff` | `#1d4ed8` | 7.2:1 ✓ |
| Focus ring | `#ffffff` (inset) | `#1d4ed8` | 7.2:1 ✓ (1.4.11) |

---

## Manual test results

> Last tested: 2026-06-12

### Keyboard-only

- [x] First Tab press on the page reveals the skip link at the top-left of the viewport
- [x] Link text "Skip to main content" is clearly readable against the blue background
- [x] Enter activates the link — focus moves to `<main>`
- [x] After activation, next Tab press moves through main content — nav is bypassed
- [x] Shift+Tab from the skip link moves focus to the browser chrome (no prior focusable element)
- [x] Second Tab press (without activating) hides the link and moves focus to the first nav item

### Screen reader (NVDA + Firefox)

- [x] First Tab announces: *"Skip to main content, link"*
- [x] Enter activates — NVDA announces the `<main>` landmark: *"main landmark"*
- [x] Link is correctly identified as a navigation aid — not confused with page content

### Contrast

- [x] Link text `#ffffff` on `#1d4ed8` — 7.2:1 ✓

---

## Common mistake

See the `CommonMistake` story. The inaccessible version:

- Skip link hidden with `display:none` — permanently inert, can never receive focus (fails **2.4.1**)
- Target `<main>` has no `tabIndex={-1}` — activating the link scrolls the viewport but focus stays on the link; next Tab returns to the nav (fails **2.4.1** in practice)
