import type { TestRunnerConfig } from '@storybook/test-runner';
import { checkA11y, configureAxe, injectAxe } from 'axe-playwright';

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page, context) {
    // Skip axe on CommonMistake stories — violations there are intentional and documented
    if (context.story.includes('CommonMistake')) return;

    await configureAxe(page, {
      rules: [
        { id: 'duplicate-id', enabled: false },
      ],
    });

    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  },
};

export default config;
