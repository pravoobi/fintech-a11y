import React, { useId, useRef, useState } from 'react';
import styles from './Tabs.module.css';

export interface Tab {
  /** Unique identifier for this tab. */
  id: string;
  /** Tab button label. */
  label: React.ReactNode;
  /** Panel content shown when this tab is active. */
  panel: React.ReactNode;
  /** Disables the tab button — skipped during arrow-key navigation. */
  disabled?: boolean;
}

export interface TabsProps {
  /** Tab definitions in display order. */
  tabs: Tab[];
  /** `id` of the initially selected tab. Defaults to the first enabled tab. */
  defaultTab?: string;
  /** `aria-label` for the `role="tablist"` landmark. Describe the tab set (e.g. "Account sections"). */
  label?: string;
  /** Fires when the active tab changes. */
  onChange?: (id: string) => void;
}

export function Tabs({ tabs, defaultTab, label, onChange }: TabsProps) {
  const uid = useId();
  const tabId   = (id: string) => `${uid}-tab-${id}`;
  const panelId = (id: string) => `${uid}-panel-${id}`;

  const firstEnabled = tabs.find((t) => !t.disabled)?.id ?? tabs[0].id;
  const [activeId, setActiveId] = useState(defaultTab ?? firstEnabled);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function activate(id: string) {
    setActiveId(id);
    onChange?.(id);
  }

  function getNextEnabled(from: number, direction: 1 | -1): number {
    let i = (from + direction + tabs.length) % tabs.length;
    while (i !== from) {
      if (!tabs[i].disabled) return i;
      i = (i + direction + tabs.length) % tabs.length;
    }
    return from;
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    let next: number | null = null;

    switch (e.key) {
      case 'ArrowRight': next = getNextEnabled(index,  1); break;
      case 'ArrowLeft':  next = getNextEnabled(index, -1); break;
      case 'Home':       next = tabs.findIndex((t) => !t.disabled);  break;
      case 'End':        next = tabs.findLastIndex((t) => !t.disabled); break;
      default: return;
    }

    if (next === null || next === -1) return;
    e.preventDefault();
    tabRefs.current[next]?.focus();
    activate(tabs[next].id);
  }

  return (
    <div className={styles.root}>
      {/* Tab list */}
      <div role="tablist" aria-label={label} className={styles.tablist}>
        {tabs.map((tab, index) => {
          const isSelected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              role="tab"
              id={tabId(tab.id)}
              aria-selected={isSelected}
              aria-controls={panelId(tab.id)}
              tabIndex={isSelected ? 0 : -1}
              disabled={tab.disabled}
              className={`${styles.tab} ${isSelected ? styles.tabSelected : ''} ${tab.disabled ? styles.tabDisabled : ''}`}
              onClick={() => activate(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={panelId(tab.id)}
            aria-labelledby={tabId(tab.id)}
            tabIndex={0}
            className={styles.panel}
            hidden={!isActive}
          >
            {tab.panel}
          </div>
        );
      })}
    </div>
  );
}
