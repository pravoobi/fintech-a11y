import '@testing-library/jest-dom';
import { configureAxe } from 'vitest-axe';
import { toHaveNoViolations } from 'vitest-axe/matchers';
import { expect } from 'vitest';

// toHaveNoViolations is a single matcher function — wrap it in an object for expect.extend
expect.extend({ toHaveNoViolations });

configureAxe({
  globalOptions: {
    rules: [
      // 4.1.1 Parsing is obsolete in WCAG 2.2 — not targeted
      { id: 'duplicate-id', enabled: false },
      // jsdom has no Canvas API so axe cannot compute contrast ratios in unit tests.
      // Contrast is verified manually and via the Storybook test-runner in a real browser.
      { id: 'color-contrast', enabled: false },
      // The "region" rule requires every element on the page to be inside a landmark.
      // Component-level tests don't render a full page structure (<main>, <nav> etc.)
      // so this rule produces false positives. Full-page landmark coverage is verified
      // in the Storybook test-runner against complete story layouts.
      { id: 'region', enabled: false },
    ],
  },
});
