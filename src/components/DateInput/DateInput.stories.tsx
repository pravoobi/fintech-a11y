import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { DateInput } from './DateInput';
import type { DateValue } from './DateInput';

const meta: Meta<typeof DateInput> = {
  title: 'Components/DateInput',
  component: DateInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
A WCAG 2.2 AA–compliant date entry component for financial-services applications. Three individually labelled fields grouped in a \`<fieldset>\` + \`<legend>\` — no calendar widget, no format mask, no caret fighting.

**Why three fields instead of a single masked input?**

Single-field date inputs with slash-insertion masks cause \`aria-invalid\` ambiguity (which part is wrong?), caret jumping that breaks keyboard editing, and reliance on a specific format the user may not expect. Three separate fields let each part be individually labelled, individually validated, and individually announced by AT.

**WCAG success criteria satisfied:**

- **1.3.1 Info and Relationships:** \`<fieldset>\` + \`<legend>\` groups the three fields; each has its own \`<label>\` ("Day", "Month", "Year") — structure is programmatically determinable.
- **1.4.1 Use of Color:** Error state uses ⚠ icon + text alongside the border change.
- **1.4.3 Contrast (Minimum):** Legend/labels meet ≥ 4.5:1 ✓.
- **1.4.10 Reflow:** Fields wrap gracefully at 320 CSS px — no horizontal scroll.
- **2.1.1 Keyboard:** Fully operable — Tab moves through each field; auto-advance and Backspace navigation are conveniences, not requirements (Tab always works).
- **2.4.7 Focus Visible:** \`focus-visible\` ring (3px solid \`#2563eb\`) on each field.
- **2.5.8 Target Size (Minimum):** Each input is 44 CSS px tall.
- **3.3.1 / 3.3.2 Error / Labels:** Error linked via \`aria-describedby\`; \`aria-invalid\` set on all three fields; persistent visible labels.
- **3.3.7 Redundant Entry:** See the \`PreFilled\` story — a date entered in a prior step is pre-populated and not re-requested.
- **4.1.2 Name, Role, Value:** \`aria-invalid\`, \`aria-describedby\`, \`aria-required\` on each input.
- **4.1.3 Status Messages:** Errors announced via persistent polite \`role="status"\` live region.

**Keyboard map:**

| Key | Action |
|-----|--------|
| \`Tab\` | Move focus to next field (Day → Month → Year) |
| \`Shift+Tab\` | Move focus to previous field |
| \`0\`–\`9\` | Enter digit; auto-advances to next field when day/month reaches 2 digits |
| \`Backspace\` (empty field) | Move focus to the previous field |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DateInput>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    legend: 'Date of birth',
    hint: 'For example, 15 03 1990',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Type a day and watch focus advance to Month automatically when 2 digits are entered. Backspace in an empty field moves focus back. Each field announces its own label to AT — screen readers hear "Day, edit" then "Month, edit" then "Year, edit", with "Date of birth" announced on group entry.',
      },
    },
  },
};

// ─── With error ───────────────────────────────────────────────────────────────

export const WithError: Story = {
  args: {
    legend: 'Date of birth',
    hint: 'For example, 15 03 1990',
    value: { day: '32', month: '13', year: '20' },
    onChange: () => {},
    errorMessage: 'Enter a valid date of birth.',
  },
  parameters: {
    docs: {
      description: {
        story:
          '`aria-invalid="true"` is set on all three inputs; the error is linked via `aria-describedby` to each one and announced by the polite live region. The ⚠ icon ensures error state is not conveyed by color alone (1.4.1).',
      },
    },
  },
};

// ─── Controlled with validation ───────────────────────────────────────────────

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<DateValue>({ day: '', month: '', year: '' });
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    function validate(v: DateValue): string {
      const d = parseInt(v.day, 10);
      const m = parseInt(v.month, 10);
      const y = parseInt(v.year, 10);

      if (!v.day && !v.month && !v.year) return 'Enter your date of birth.';
      if (!v.day || d < 1 || d > 31) return 'Enter a valid day (1–31).';
      if (!v.month || m < 1 || m > 12) return 'Enter a valid month (1–12).';
      if (!v.year || v.year.length < 4 || y < 1900 || y > new Date().getFullYear())
        return 'Enter a valid four-digit year.';
      return '';
    }

    function handleChange(v: DateValue) {
      setValue(v);
      if (submitted) setError(validate(v));
    }

    function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setSubmitted(true);
      const err = validate(value);
      setError(err);
      if (!err) setError('');
    }

    const isValid = submitted && !error;

    return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <DateInput
          legend="Date of birth"
          hint="For example, 15 03 1990"
          value={value}
          onChange={handleChange}
          errorMessage={error}
          required
        />
        <button
          type="submit"
          style={{
            padding: '0.5rem 1.25rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            minHeight: '44px',
            alignSelf: 'flex-start',
          }}
        >
          Continue
        </button>
        {isValid && (
          <p style={{ fontSize: '0.875rem', color: '#16a34a', margin: 0 }}>
            ✓ Date of birth: {value.day}/{value.month}/{value.year}
          </p>
        )}
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Validation fires on submit and updates on subsequent changes. Try submitting empty, with out-of-range values, or a 2-digit year — each produces a specific error message. The polite live region announces the error without moving focus (4.1.3).',
      },
    },
  },
};

// ─── Pre-filled (3.3.7 Redundant Entry) ──────────────────────────────────────

export const PreFilled: Story = {
  render: () => {
    // Simulates data carried forward from a prior onboarding step (3.3.7)
    const [value, setValue] = useState<DateValue>({ day: '15', month: '03', year: '1990' });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
          Pre-populated from your profile — edit only if incorrect.
        </p>
        <DateInput
          legend="Date of birth"
          hint="For example, 15 03 1990"
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates **3.3.7 Redundant Entry** — a date of birth collected in a prior step is pre-populated here rather than re-requested. The user only needs to edit if the value is incorrect.',
      },
    },
  },
};

// ─── Required ─────────────────────────────────────────────────────────────────

export const Required: Story = {
  args: {
    legend: 'Date of birth',
    hint: 'For example, 15 03 1990',
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'All three inputs carry `required` and `aria-required="true"`. The visual asterisk in the legend is `aria-hidden`.',
      },
    },
  },
};

// ─── Disabled ─────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: {
    legend: 'Date of birth',
    value: { day: '15', month: '03', year: '1990' },
    onChange: () => {},
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'All three inputs are disabled and visually muted.',
      },
    },
  },
};

// ─── Common Mistake ────────────────────────────────────────────────────────────
// Intentionally inaccessible. Violations are documented. Do not fix this component.

function InaccessibleDateInput() {
  const [value, setValue] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value.replace(/[^\d/]/g, '');

    // ✗ Auto-inserts slashes on every keystroke — causes caret to jump to the
    //   end on each character typed, making keyboard editing unusable (fails 2.1.1)
    if (raw.length === 2 && !raw.includes('/')) raw += '/';
    if (raw.length === 5 && raw.split('/').length === 2) raw += '/';

    setValue(raw.slice(0, 10));
  }

  return (
    // ✗ Plain <div> wrapper — no <fieldset> or <legend> (fails 1.3.1)
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {/* ✗ No <label> — placeholder is the only hint (fails 3.3.2, 1.3.1) */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        // ✗ Placeholder as label — disappears on input (fails 3.3.2)
        placeholder="DD/MM/YYYY"
        style={{
          padding: '0.625rem 0.75rem',
          border: '1.5px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '1rem',
          width: '12rem',
        }}
      />
      {/* ✗ Format instruction below the field — too late; user already confused */}
      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Format: DD/MM/YYYY</span>
    </div>
  );
}

export const CommonMistake: Story = {
  render: () => <InaccessibleDateInput />,
  parameters: {
    docs: {
      description: {
        story: `
**Inaccessible pattern — do not copy.**

Type "1" then "5" — a slash is auto-inserted after your second digit, jumping the caret to the end. Continue typing "0" + "3" — another slash appears. This is one of the most common date-input mistakes in financial UIs.

| Mistake | Violated criterion | Why it fails |
|---|---|---|
| No \`<label>\` — placeholder only | **3.3.2 Labels or Instructions**, **1.3.1 Info and Relationships** | Placeholder disappears on input; AT announces the input with no accessible name. |
| No \`<fieldset>\` + \`<legend>\` | **1.3.1 Info and Relationships** | The date field has no programmatically determinable grouping or purpose. |
| Slash auto-inserted on every keystroke | **2.1.1 Keyboard** | The caret jumps to the end on the 2nd and 5th characters. Keyboard users cannot edit a date they've already entered — they must clear the field and retype it. |
| Single field for a three-part value | **1.3.1 Info and Relationships**, **3.3.1 Error Identification** | If the date is invalid, it's impossible to communicate which part (day, month, or year) is wrong. \`aria-invalid\` applies to the whole field — useless for a partial error. |
| Format instruction below the input | **3.3.2 Labels or Instructions** | Instructions should appear before the control, not after. By the time a screen reader user focuses the field, they've missed the hint. |
        `,
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'label', enabled: false },
          { id: 'aria-input-field-name', enabled: false },
        ],
      },
    },
  },
};
