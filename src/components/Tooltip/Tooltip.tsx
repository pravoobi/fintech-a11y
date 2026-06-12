import React, { useId, useRef, useState } from 'react';
import styles from './Tooltip.module.css';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /**
   * Supplementary description shown in the tooltip.
   * Must not be the only source of information critical to completing a task —
   * that information must also appear in the visible label or nearby text.
   */
  content: string;
  /** A single focusable trigger element. Receives `aria-describedby` pointing to the tooltip. */
  children: React.ReactElement;
  /** Tooltip placement relative to the trigger. Default: `'top'`. */
  placement?: TooltipPlacement;
  /** CSS max-width of the tooltip bubble. Default: `'16rem'`. */
  maxWidth?: string;
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  maxWidth = '16rem',
}: TooltipProps) {
  const tooltipId = useId();
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(true);
  }

  // Small delay so the pointer can travel from trigger to tooltip without
  // the tooltip disappearing mid-move (1.4.13 — Hoverable)
  function scheduleHide() {
    hideTimer.current = setTimeout(() => setVisible(false), 100);
  }

  function hideImmediately() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(false);
  }

  // Merge any existing aria-describedby on the child
  const existingDescribedBy = children.props['aria-describedby'] as string | undefined;
  const describedBy = existingDescribedBy
    ? `${existingDescribedBy} ${tooltipId}`
    : tooltipId;

  const trigger = React.cloneElement(children, {
    'aria-describedby': describedBy,
    onFocus(e: React.FocusEvent) {
      show();
      children.props.onFocus?.(e);
    },
    onBlur(e: React.FocusEvent) {
      hideImmediately();
      children.props.onBlur?.(e);
    },
    onKeyDown(e: React.KeyboardEvent) {
      // Escape dismisses the tooltip without moving focus (1.4.13 — Dismissible, 2.1.1)
      if (e.key === 'Escape') hideImmediately();
      children.props.onKeyDown?.(e);
    },
  });

  return (
    <span
      className={styles.wrapper}
      onMouseEnter={show}
      onMouseLeave={scheduleHide}
    >
      {trigger}

      {/*
        Always in the DOM so aria-describedby can resolve the text at focus time.
        Visually hidden via visibility + opacity (not display:none) to preserve
        the AT text resolution while keeping it off-screen when not needed.
      */}
      <span
        id={tooltipId}
        role="tooltip"
        className={`${styles.tooltip} ${styles[placement]} ${visible ? styles.visible : ''}`}
        style={{ maxWidth }}
      >
        {content}
      </span>
    </span>
  );
}
