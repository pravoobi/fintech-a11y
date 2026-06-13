import React from 'react';
import type { Preview } from '@storybook/react';
import '../src/tokens.css';

const preview: Preview = {
  parameters: {
    a11y: {
      config: {
        rules: [
          // 4.1.1 Parsing is obsolete in WCAG 2.2
          { id: 'duplicate-id', enabled: false },
        ],
      },
    },
    layout: 'centered',
    docs: {
      toc: true,
    },
  },
  decorators: [
    (Story) =>
      React.createElement(
        'div',
        { style: { maxWidth: '480px', width: '100%', padding: '2rem', fontFamily: 'system-ui, sans-serif' } },
        React.createElement(Story)
      ),
  ],
};

export default preview;
