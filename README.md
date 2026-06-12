# fintech-a11y

A living reference of **WCAG 2.2 AA**–compliant React UI patterns for financial-services applications. Built to show exactly how the components that most often break accessibility in fintech UIs should be implemented — and why the common shortcuts fail.

**[View Storybook →](https://pravoobi.github.io/fintech-a11y/)**

---

## What's in here

Each component ships with three things that together make this more than a "nice components" repo:

1. An **accessible implementation** built to specific, named WCAG 2.2 success criteria.
2. **Automated audits** (axe via Vitest + jsdom, and in-browser via Storybook test-runner) — treated as a floor, not proof of compliance.
3. **Documented manual testing** — keyboard, screen reader, zoom/reflow, contrast — which is where real accessibility is verified.
4. A **"Common Mistake" story** per component showing the inaccessible version with an explanation of exactly which criteria it fails and why.

---

## Components

| Component | Key WCAG 2.2 criteria |
|---|---|
| **OTPInput** | 3.3.8 Accessible Authentication · 4.1.3 Status Messages · 2.5.8 Target Size · 1.3.1 |
| **FormField** | 3.3.1 Error Identification · 3.3.2 Labels · 4.1.3 · 1.4.1 |
| **PasswordInput** | 3.3.8 · 2.5.3 Label in Name · 4.1.2 · 2.4.7 |
| **AmountInput** | 1.3.1 Info & Relationships · 2.1.1 Keyboard · 4.1.2 |
| **StepProgress** | 3.3.7 Redundant Entry · 1.3.1 · 1.4.1 · 4.1.2 |
| **Modal** | 2.1.2 No Keyboard Trap · 2.4.3 Focus Order · 2.4.11 Focus Not Obscured · 4.1.2 |
| **DataTable** | 1.3.1 · 4.1.2 · 4.1.3 Status Messages · 2.5.8 |
| **Toast** | 4.1.3 · 2.2.1 Timing Adjustable · 1.4.1 · 2.5.8 |
| **Combobox** | 4.1.2 Name Role Value · 2.1.1 Keyboard · 4.1.3 · 1.3.1 |
| **DateInput** | 1.3.1 Info & Relationships · 3.3.1 Error Identification · 3.3.7 Redundant Entry · 2.1.1 |
| **Alert** | 4.1.3 Status Messages · 1.4.1 Use of Color · 1.3.1 · 2.5.8 · 4.1.2 |

---

## New in WCAG 2.2 — covered here

| Criterion | Level | Where |
|---|---|---|
| **2.4.11 Focus Not Obscured** | AA | Modal — panel uses `max-height` + internal scroll so focused elements are never hidden behind the backdrop |
| **2.5.7 Dragging Movements** | AA | No drag-only interactions in any component |
| **2.5.8 Target Size (Minimum)** — 24×24 CSS px | AA | OTPInput boxes · PasswordInput toggle · Modal close button · DataTable sort buttons · Toast dismiss button |
| **3.2.6 Consistent Help** | A | Not applicable — no help affordance |
| **3.3.7 Redundant Entry** | A | StepProgress `Controlled` story — data from step 1 is persisted and shown in later steps, never re-requested |
| **3.3.8 Accessible Authentication (Minimum)** | AA | OTPInput — paste allowed, `one-time-code` autocomplete; PasswordInput — paste allowed, `current-password` / `new-password` autocomplete |

---

## Tech stack

- **React 18 + TypeScript** (strict mode), built with **Vite**
- **Storybook 8** for docs and showcase
- **Vitest** + **vitest-axe** (jsdom) for unit-level axe assertions
- **@storybook/addon-a11y** + **@storybook/test-runner** (Playwright) for in-browser axe
- **@testing-library/react** + **@testing-library/user-event** for interaction tests
- **eslint-plugin-jsx-a11y** in the lint config
- Plain **CSS Modules** — no design-system dependency so patterns transfer to any stack

---

## Run locally

```bash
npm install

# Vite dev server
npm run dev

# Storybook
npm run storybook

# Unit tests (Vitest + vitest-axe)
npm test

# In-browser axe via Storybook test-runner (requires Storybook running)
npm run test:a11y

# Lint (ESLint + jsx-a11y)
npm run lint
```

---

## Why two layers of axe

`vitest-axe` runs in **jsdom**, which cannot evaluate real focus, visibility, or computed layout — so it misses focus-order, focus-obscured, target-size, and contrast issues. The **Storybook test-runner** runs axe in a real browser via Playwright and catches more. Neither is sufficient alone, and **neither proves WCAG compliance** — manual keyboard and screen reader testing is what verifies real-world accessibility.

---

## Definition of done (per component)

A component is done only when all of these hold:

- `vitest-axe` passes (jsdom) and Storybook test-runner axe is green in a real browser
- Keyboard-only operation verified: reach, operate, and leave with no trap; visible focus throughout
- Screen reader checked manually with NVDA + Firefox or VoiceOver + Safari
- Reflow / zoom: usable at 200% and at 320 CSS px without loss of content or horizontal scroll (1.4.10)
- Contrast: text ≥ 4.5:1, UI/state indicators ≥ 3:1 (1.4.3 / 1.4.11) — verified, not assumed
- Target sizes ≥ 24×24 CSS px for all interactive controls (2.5.8)
- Component `README.md` lists the satisfied criteria, keyboard map, and manual test results
- `Default` and `CommonMistake` stories exist with documented violations

---

## Shared hooks

| Hook | Used by |
|---|---|
| `src/hooks/useFocusTrap.ts` | Modal — traps Tab/Shift+Tab within a container, handles Escape, restores focus on close |
| `src/hooks/useToast.tsx` | Toast — context + provider for queuing and dismissing notifications |
