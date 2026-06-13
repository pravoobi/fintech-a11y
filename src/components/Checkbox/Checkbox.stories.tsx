import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox, CheckboxGroup } from './Checkbox';
import type { CheckboxOption } from './Checkbox';

// ═══════════════════════════════════════════════════════════════════════════════
// Checkbox — single
// ═══════════════════════════════════════════════════════════════════════════════

const checkboxMeta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'padded',
  },
};

export default checkboxMeta;

type CheckboxStory = StoryObj<typeof Checkbox>;

export const Default: CheckboxStory = {
  parameters: {
    docs: {
      description: {
        story: `
**Accessible single checkbox.** Covers WCAG 2.2 AA criteria:

| Criterion | How |
|---|---|
| **1.3.1 Info & Relationships** | Native \`<input type="checkbox">\` inside \`<label htmlFor>\` — association is programmatically determinable |
| **1.4.1 Use of Color** | Error shown with ⚠ icon + text — not colour alone |
| **1.4.3 Contrast** | Label \`#1a1a1a\` = 18.1:1 ✓; hint/error colours verified |
| **2.1.1 Keyboard** | Tab to reach, Space to toggle |
| **2.4.7 Focus Visible** | \`focus-visible\` ring (3px solid \`#2563eb\`) |
| **2.5.8 Target Size** | Full row ≥ 44 CSS px tall — entire label is the click target |
| **3.3.1 Error Identification** | \`aria-invalid="true"\` + error linked via \`aria-describedby\` |
| **3.3.2 Labels or Instructions** | Persistent visible label always rendered |
| **4.1.2 Name, Role, Value** | \`aria-invalid\`, \`aria-describedby\`, \`aria-required\`, \`indeterminate\` DOM property |
| **4.1.3 Status Messages** | Error announced via polite \`role="status"\` live region |

**Keyboard map:**

| Key | Action |
|-----|--------|
| \`Tab\` | Reach the checkbox |
| \`Space\` | Toggle checked/unchecked |
        `,
      },
    },
  },
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        label="I agree to the terms and conditions"
        checked={checked}
        onChange={setChecked}
        hint="You must agree before continuing."
      />
    );
  },
};

export const WithError: CheckboxStory = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        label="I agree to the terms and conditions"
        checked={checked}
        onChange={setChecked}
        errorMessage="You must accept the terms to continue."
      />
    );
  },
};

export const Required: CheckboxStory = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        label="I consent to receiving marketing communications"
        checked={checked}
        onChange={setChecked}
        required
        hint="We'll only contact you about relevant products."
      />
    );
  },
};

export const Indeterminate: CheckboxStory = {
  parameters: {
    docs: {
      description: {
        story:
          'Indeterminate state is set as a DOM property (not an HTML attribute), which browsers map to `aria-checked="mixed"` in the accessibility tree.',
      },
    },
  },
  render: () => (
    <Checkbox
      label="Select all accounts"
      indeterminate
      hint="Some accounts are selected."
    />
  ),
};

export const Disabled: CheckboxStory = {
  render: () => (
    <Checkbox
      label="I agree to the terms and conditions"
      checked={false}
      disabled
    />
  ),
};

// ═══════════════════════════════════════════════════════════════════════════════
// CheckboxGroup
// ═══════════════════════════════════════════════════════════════════════════════

const groupMeta: Meta<typeof CheckboxGroup> = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  parameters: {
    layout: 'padded',
  },
};

export { groupMeta };

const NOTIFICATION_OPTIONS: CheckboxOption[] = [
  { value: 'email', label: 'Email notifications', hint: 'Receive updates by email' },
  { value: 'sms', label: 'SMS notifications', hint: 'Receive updates by text' },
  { value: 'push', label: 'Push notifications', hint: 'Receive updates in the app' },
];

export const GroupDefault: StoryObj<typeof CheckboxGroup> = {
  name: 'Group / Default',
  parameters: {
    docs: {
      description: {
        story: `
**Accessible checkbox group.** Uses \`<fieldset>\` + \`<legend>\` so AT announces the group name alongside each option.

Additional criteria satisfied:

| Criterion | How |
|---|---|
| **1.3.1** | \`<fieldset>\` + \`<legend>\` groups options; each input has an associated \`<label>\` |
| **4.1.2** | \`aria-invalid\`, \`aria-describedby\`, \`aria-required\` on each input |
| **4.1.3** | Error announced via polite \`role="status"\` live region |
| **2.1.1** | All checkboxes in natural Tab order |
        `,
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<string[]>(['email']);
    return (
      <CheckboxGroup
        legend="Notification preferences"
        options={NOTIFICATION_OPTIONS}
        value={value}
        onChange={setValue}
        hint="Choose how you'd like to receive account alerts."
      />
    );
  },
};

export const GroupWithSelectAll: StoryObj<typeof CheckboxGroup> = {
  name: 'Group / Select All',
  parameters: {
    docs: {
      description: {
        story:
          'The "Select all" checkbox uses the `indeterminate` DOM property when some (not all) options are checked — per ARIA APG pattern for tri-state checkboxes.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<string[]>(['email']);
    return (
      <CheckboxGroup
        legend="Notification preferences"
        options={NOTIFICATION_OPTIONS}
        value={value}
        onChange={setValue}
        showSelectAll
      />
    );
  },
};

export const GroupWithError: StoryObj<typeof CheckboxGroup> = {
  name: 'Group / Error State',
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <CheckboxGroup
        legend="Notification preferences"
        options={NOTIFICATION_OPTIONS}
        value={value}
        onChange={setValue}
        errorMessage="Select at least one notification method."
        required
      />
    );
  },
};

export const GroupDisabled: StoryObj<typeof CheckboxGroup> = {
  name: 'Group / Disabled',
  render: () => (
    <CheckboxGroup
      legend="Notification preferences"
      options={NOTIFICATION_OPTIONS}
      value={['email']}
      disabled
    />
  ),
};

// ─── Common Mistake ───────────────────────────────────────────────────────────

export const CommonMistake: CheckboxStory = {
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'label', enabled: false },
          { id: 'aria-required-children', enabled: false },
        ],
      },
    },
    docs: {
      description: {
        story: `
**Inaccessible checkbox — do not copy.**

This version demonstrates the common shortcuts that break accessibility:

| Violation | Criterion | Why it fails |
|---|---|---|
| \`<div role="checkbox">\` with \`tabIndex={0}\` | **4.1.2** | No native checked state; screen readers must infer state from \`aria-checked\` which is absent here |
| Visual check mark via CSS content only | **1.4.1** | State conveyed by colour/icon alone with no semantic checked attribute |
| Click handler on div, no keyboard handler | **2.1.1** | Space key does nothing — only mouse works |
| No associated label element | **1.3.1** | Placeholder text is not a real label; purpose not programmatically determinable |
| Inline \`style\` color for error | **1.4.1** | Red border/text alone with no icon or \`aria-invalid\` |
        `,
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* div-based "checkbox" — not keyboard operable, no semantic state */}
      <div
        role="checkbox"
        tabIndex={0}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          padding: '0.5rem',
          border: '2px solid red',
        }}
        onClick={() => {}}
      >
        <div
          style={{
            width: 18,
            height: 18,
            border: '2px solid #888',
            borderRadius: 3,
            background: '#fff',
          }}
        />
        <span>I agree to the terms and conditions</span>
      </div>
      {/* Error shown by red color only — no icon, no aria-invalid */}
      <p style={{ color: 'red', margin: 0, fontSize: '0.875rem' }}>
        You must accept the terms.
      </p>
    </div>
  ),
};
