# CLAUDE.md — a11y-fintech

> Project instructions for Claude Code. Read this fully before writing or editing any component, test, or story.

## What this project is

`a11y-fintech` is a living reference of **WCAG 2.2 AA**–compliant React UI patterns for financial-services applications. It targets the components that most often break accessibility in fintech UIs — authentication inputs, money inputs, multi-step onboarding, validated forms, dialogs, sortable tables, and live notifications.

Each component ships with three things that, together, make this more than a "nice components" repo:

1. An **accessible implementation** built to specific, named WCAG 2.2 success criteria.
2. **Automated audits** (axe via unit tests and in-browser) — treated as a *floor*, not proof of compliance.
3. **Documented manual testing** — keyboard, screen reader, zoom/reflow, contrast — which is where real accessibility is verified.
4. A **"common mistake" story** per component showing the inaccessible version with an explanation of *why* it fails.

The positioning to preserve in the README and everywhere public: this is a reference of accessible fintech patterns built by someone with production experience on regulated consumer financial UIs. **Do not name any specific employer, product, or platform anywhere in the repo, commits, docs, or stories.** The components are universal fintech patterns; keep them framed that way.

## Tech stack

- **React 18 + TypeScript** (strict mode), built with **Vite**
- **Storybook 8** for docs/showcase, deployed to GitHub Pages
- **Vitest** + **vitest-axe** (jsdom) for unit-level accessibility assertions
- **@storybook/addon-a11y** + **@storybook/test-runner** (Playwright) for in-browser axe runs
- **@testing-library/react** + **@testing-library/user-event** for interaction tests
- **eslint-plugin-jsx-a11y** in the lint config
- Styling: plain CSS modules or vanilla-extract (no design-system dependency; keep it framework-agnostic so the patterns transfer)

## Why two layers of axe

`vitest-axe` runs in **jsdom**, which cannot evaluate real focus, visibility, or computed layout — so it misses focus-order, focus-obscured, target-size, and contrast issues. The **Storybook test-runner** runs axe in a **real browser** via Playwright and catches more. Use both. Neither is sufficient on its own, and **neither proves WCAG compliance** — see "Definition of done."

## Repo structure

```
a11y-fintech/
├── CLAUDE.md
├── README.md
├── .storybook/
│   ├── main.ts
│   ├── preview.ts            # addon-a11y config, global a11y rules
│   └── test-runner.ts        # axe injection for in-browser audits
├── src/
│   ├── components/
│   │   └── <ComponentName>/
│   │       ├── <ComponentName>.tsx
│   │       ├── <ComponentName>.module.css
│   │       ├── <ComponentName>.test.tsx      # behaviour + vitest-axe
│   │       ├── <ComponentName>.stories.tsx   # Default + CommonMistake
│   │       ├── index.ts
│   │       └── README.md                     # criteria, keyboard map, manual results
│   ├── hooks/                # shared: useFocusTrap, useId, useLiveRegion, etc.
│   └── test/
│       └── setup.ts          # extends expect with toHaveNoViolations
└── package.json
```

## WCAG 2.2 — what we target

Target level: **AA**. We do not target the removed **4.1.1 Parsing** criterion (obsoleted in 2.2). Pay particular attention to the criteria new in 2.2, several of which map directly onto these components:

| New in 2.2 | Level | Where it bites here |
|---|---|---|
| 2.4.11 Focus Not Obscured (Minimum) | AA | Modal scroll regions, sticky headers over focused fields |
| 2.5.7 Dragging Movements | AA | Any slider/drag affordance (e.g. amount slider) needs a non-drag alternative |
| 2.5.8 Target Size (Minimum) — 24×24 CSS px | AA | OTP boxes, sort buttons, show/hide toggle, toast dismiss |
| 3.2.6 Consistent Help | A | If a help/support affordance exists, keep it in a consistent place |
| 3.3.7 Redundant Entry | A | Onboarding stepper must not re-ask for data already entered |
| 3.3.8 Accessible Authentication (Minimum) | AA | OTP and password inputs: allow paste + password managers; no cognitive-function test without an alternative |

Always-relevant baseline criteria across components: **1.3.1** Info & Relationships, **1.4.1** Use of Color, **1.4.3** Contrast, **1.4.11** Non-text Contrast, **2.1.1/2.1.2** Keyboard / No Trap, **2.4.3** Focus Order, **2.4.7** Focus Visible, **2.5.3** Label in Name, **3.3.1/3.3.2/3.3.3** Error Identification / Labels / Error Suggestion, **4.1.2** Name Role Value, **4.1.3** Status Messages.

## Components to build

Build in this order. Each is independently presentable — never leave the repo looking unfinished.

**Stage 1 (ship first):** OTPInput · FormField · PasswordInput
**Stage 2:** AmountInput · StepProgress · Modal
**Stage 3:** DataTable · Toast

### 1. OTPInput
- **Key criteria:** 3.3.8 Accessible Authentication, 4.1.3 Status Messages, 2.5.8 Target Size, 1.3.1.
- Group the fields in a `fieldset` with a `legend` (or `role="group"` + `aria-label`); each input individually labelled (e.g. "Digit 1 of 6"), visually-hidden labels are fine.
- `inputmode="numeric"`, `autocomplete="one-time-code"` on the first/group input so platform OTP autofill works.
- **Must allow paste** of the full code and distribute it across fields — pasting one value fills all. Never block paste.
- Auto-advance focus on entry; Backspace moves to previous field. Don't auto-submit silently — if you do submit on completion, announce it via a polite live region.
- **Common mistake story:** blocks paste, no per-field labels, no `one-time-code` autocomplete, auto-submits with no announcement (fails 3.3.8 + 4.1.3).

### 2. FormField (label + control + inline validation)
- **Key criteria:** 3.3.1, 3.3.2, 3.3.3, 1.4.1, 1.3.1, 4.1.3.
- Always render a real `<label>` associated via `htmlFor`/`id` — never placeholder-as-label.
- Error text linked with `aria-describedby`; set `aria-invalid="true"` when invalid.
- Error state must **not rely on color alone** — include the error text and a non-text-contrast-compliant icon. Live-validated errors announced via a polite live region (or focus management on submit).
- **Common mistake story:** red border only, placeholder used as label, error text present but not linked by `aria-describedby` (fails 1.4.1 + 1.3.1 + 3.3.1).

### 3. PasswordInput (with show/hide toggle)
- **Key criteria:** 4.1.2, 2.5.3 Label in Name, 3.3.8, 2.4.7.
- Toggle is a real `<button type="button">` with an accessible name that reflects state ("Show password" / "Hide password"); use a visible-text or aria-label + `aria-pressed` consistently.
- **Focus must stay on the toggle** after activation — do not move focus to the field or lose it.
- `autocomplete="current-password"` / `"new-password"`; never block paste (3.3.8 — support password managers).
- **Common mistake story:** icon-only toggle with no accessible name, focus lost on toggle, paste blocked (fails 2.5.3 + 4.1.2 + 3.3.8).

### 4. AmountInput (currency)
- **Key criteria:** 1.3.1, 4.1.2, 2.5.7 (if a slider variant exists), 1.4.11.
- The currency must be conveyed to assistive tech, not just shown as a decorative symbol — use a visually-hidden suffix/prefix or `aria-describedby` so the field's purpose and unit are announced.
- `inputmode="decimal"`. Formatting (thousands separators) must **not trap or jump the caret** during keyboard editing — format on blur or use a caret-safe approach.
- If you add a slider/stepper, it needs keyboard control and (per 2.5.7) no drag-only interaction.
- **Common mistake story:** `$` is decorative-only so screen readers announce a bare number, and formatting fights the caret on each keystroke (fails 1.3.1 + keyboard operability).

### 5. StepProgress (onboarding stepper)
- **Key criteria:** 3.3.7 Redundant Entry, 4.1.3, 1.3.1, 1.4.1.
- Mark the current step with `aria-current="step"`. Communicate position and completion to AT (e.g. visually-hidden "Step 2 of 5 — completed"). Use an ordered list or `nav` with an accessible name.
- Implement (or stub + document) **Redundant Entry**: data entered in a prior step is persisted/auto-populated, not re-requested.
- **Common mistake story:** progress shown by color/position only with no `aria-current` and no text alternative; later step re-asks for the email already entered (fails 1.4.1 + 1.3.1 + 3.3.7).

### 6. Modal / Dialog
- **Key criteria:** 2.1.2 No Keyboard Trap, 2.4.3 Focus Order, 2.4.11 Focus Not Obscured, 4.1.2.
- `role="dialog"` + `aria-modal="true"`, labelled via `aria-labelledby` (and `aria-describedby` if there's body copy).
- **Focus trap** that is itself escapable (Esc closes); **return focus** to the triggering element on close; **lock background scroll**; render content not hidden behind sticky chrome when focused (2.4.11).
- Put trap logic in `hooks/useFocusTrap`.
- **Common mistake story:** no focus trap (Tab escapes to the page behind), focus not returned to trigger, background scrolls, missing `aria-labelledby` (fails 2.4.3 + 4.1.2).

### 7. DataTable (sortable)
- **Key criteria:** 1.3.1, 4.1.2, 4.1.3, 2.5.8.
- Real `<table>` with `<th scope="col">`. Sort control is a `<button>` inside the header cell; the header carries `aria-sort` of `ascending` / `descending` / `none`.
- Announce sort changes via a polite live region (4.1.3). Sort buttons meet the 24×24 target size.
- **Common mistake story:** `<div>`-based grid with no table semantics, sort triggered by click handler on a non-button, `aria-sort` absent (fails 1.3.1 + 4.1.2).

### 8. Toast / Alert
- **Key criteria:** 4.1.3 Status Messages, 2.2.1 Timing Adjustable, 1.4.1, 2.5.8.
- Mount a persistent live region (`role="status"` / `aria-live="polite"` for non-critical, `role="alert"` for urgent) so messages are announced **without moving focus**.
- If toasts auto-dismiss, the timing must be adjustable/pausable, or long enough, per 2.2.1; provide a dismiss button (24×24 min). Severity must not be color-only — include text and/or an icon.
- **Common mistake story:** toast injected into the DOM with no live region so screen readers stay silent, auto-dismisses in ~2s, severity shown by color alone (fails 4.1.3 + 2.2.1 + 1.4.1).

## Story conventions

Every component exports at least two stories:

- **`Default`** — the accessible implementation, with the keyboard map and the WCAG criteria it satisfies in the story `description` (use `parameters.docs.description.story`).
- **`CommonMistake`** — the inaccessible version, with a comment/description block stating exactly which success criteria it violates and why. Disable the relevant axe rule failures only where the violation is *intentional and documented*, never to hide a real bug in `Default`.

Keep one shared decorator that constrains width and applies the base CSS so stories read cleanly on GitHub Pages.

## Testing conventions

In `src/test/setup.ts`, extend Vitest's `expect` with `toHaveNoViolations`. Every `*.test.tsx`:

1. Renders the component and asserts **no axe violations** (`expect(await axe(container)).toHaveNoViolations()`).
2. Tests **keyboard interaction** with `user-event` (Tab order, Enter/Space activation, Esc, arrow keys where relevant) — not just clicks.
3. Asserts the **accessible name/role/state** via Testing Library's `getByRole`/`toHaveAccessibleName`/`toHaveAttribute` (e.g. `aria-sort`, `aria-current`, `aria-invalid`, `aria-pressed`).

The Storybook test-runner runs axe in a real browser against every story (excluding intentional `CommonMistake` violations). Wire it in `.storybook/test-runner.ts`.

## Definition of done (per component)

A component is done only when **all** of these hold:

- [ ] `vitest-axe` passes (jsdom) and the Storybook test-runner axe pass is green in a real browser.
- [ ] Keyboard-only operation verified: reach, operate, and leave with no trap; visible focus throughout.
- [ ] **Screen reader checked manually** with at least one of NVDA + Firefox or VoiceOver + Safari; the announced name, role, state, and any live-region updates make sense, not just "technically present."
- [ ] **Reflow / zoom**: usable at 200% and at 320 CSS px width without loss of content or horizontal scroll (1.4.10).
- [ ] **Contrast**: text ≥ 4.5:1, UI/state indicators ≥ 3:1 (1.4.3 / 1.4.11) — verified, not assumed.
- [ ] Target sizes ≥ 24×24 CSS px for interactive controls (2.5.8).
- [ ] Component `README.md` lists the satisfied criteria, the keyboard map, and the manual test results.
- [ ] `Default` and `CommonMistake` stories exist and the mistake's violated criteria are documented.

**Important framing rule for Claude Code:** never describe a component as "WCAG AA compliant" on the basis of axe alone. Axe catches only a subset of issues. State results precisely — e.g. "passes automated axe checks; manual keyboard and screen-reader testing documented in the component README."

## Commands

```bash
npm install
npm run dev            # Vite dev server
npm run storybook      # Storybook locally
npm run build-storybook
npm test               # Vitest + vitest-axe
npm run test:a11y      # Storybook test-runner (in-browser axe) — requires storybook running/built
npm run lint           # eslint incl. jsx-a11y
```

## Conventions

- TypeScript strict; no `any`. Public props fully typed and documented with JSDoc.
- Prefer native semantic elements over ARIA. Add ARIA only when no native element fits, and never duplicate semantics.
- Generate `id`s with React's `useId` so labels/`aria-describedby` associations are stable and collision-free.
- Keep shared a11y logic in `hooks/` (`useFocusTrap`, `useLiveRegion`, etc.) and reuse it.
- Conventional Commits. Keep all commit messages, branch names, and code comments free of any employer or product name.
