import styles from './SkipLink.module.css';

export interface SkipLinkProps {
  /**
   * The `id` of the element to skip to — must match a `tabIndex={-1}` element on the page.
   * Default: `"main-content"`.
   */
  targetId?: string;
  /** Visible link text. Default: `"Skip to main content"`. */
  label?: string;
}

/**
 * Place this as the very first element inside `<body>`. It is visually hidden
 * until focused, then slides into view so sighted keyboard users can see and
 * activate it.
 *
 * The target element MUST have `tabIndex={-1}` so focus moves there reliably
 * across all browsers when the link is activated:
 *
 *   <main id="main-content" tabIndex={-1}>…</main>
 */
export function SkipLink({
  targetId = 'main-content',
  label = 'Skip to main content',
}: SkipLinkProps) {
  return (
    <a href={`#${targetId}`} className={styles.skipLink}>
      {label}
    </a>
  );
}
