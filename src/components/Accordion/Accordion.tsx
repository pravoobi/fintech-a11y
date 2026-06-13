import React, { useId, useState } from 'react';
import styles from './Accordion.module.css';

export interface AccordionItem {
  /** Unique identifier for this item. */
  id: string;
  /** Button label shown in the heading. */
  heading: React.ReactNode;
  /** Panel content revealed when the item is open. */
  panel: React.ReactNode;
}

export interface AccordionProps {
  /** Accordion items in display order. */
  items: AccordionItem[];
  /**
   * When `false` (default), opening one item closes all others.
   * When `true`, multiple items can be open simultaneously.
   */
  allowMultiple?: boolean;
  /** `id`s of items that are open on first render. */
  defaultOpen?: string[];
  /**
   * Heading level for the `<h2>`–`<h6>` that wraps each trigger button.
   * Match the surrounding page heading hierarchy. Default: `3`.
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  headingLevel = 3,
}: AccordionProps) {
  const uid = useId();
  const triggerId = (id: string) => `${uid}-trigger-${id}`;
  const panelId   = (id: string) => `${uid}-panel-${id}`;

  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpen));

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }

  const Heading = `h${headingLevel}` as keyof JSX.IntrinsicElements;

  return (
    <div className={styles.accordion}>
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        return (
          <div key={item.id} className={styles.item}>
            {/* Heading wraps the button so screen reader users can navigate
                the accordion via heading shortcuts (e.g. H key in NVDA) */}
            <Heading className={styles.heading}>
              <button
                type="button"
                id={triggerId(item.id)}
                aria-expanded={isOpen}
                aria-controls={panelId(item.id)}
                className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
                onClick={() => toggle(item.id)}
              >
                <span className={styles.triggerLabel}>{item.heading}</span>
                {/* Icon rotation reinforces open/closed — aria-expanded carries the state (4.1.2) */}
                <span
                  aria-hidden="true"
                  className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`}
                >
                  ›
                </span>
              </button>
            </Heading>

            {/* role="region" + aria-labelledby lets AT users navigate to the
                panel directly; recommended when ≤ 6 items to avoid landmarks clutter */}
            <div
              id={panelId(item.id)}
              role="region"
              aria-labelledby={triggerId(item.id)}
              className={styles.panel}
              hidden={!isOpen}
            >
              <div className={styles.panelInner}>{item.panel}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
