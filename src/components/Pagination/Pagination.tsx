import React, { useId } from 'react';
import styles from './Pagination.module.css';

export interface PaginationProps {
  /** Currently active page (1-based). */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Fires when the user selects a different page. */
  onPageChange: (page: number) => void;
  /** Pages shown on each side of the current page before an ellipsis appears. Default: 1. */
  siblingCount?: number;
  /** Accessible label for the <nav> landmark. Default: "Pagination". */
  navigationLabel?: string;
}

type PageItem = number | 'start-ellipsis' | 'end-ellipsis';

function buildPageRange(current: number, total: number, siblings: number): PageItem[] {
  if (total <= 1) return [1];

  // Sibling window — never overlap with page 1 or total (they are always rendered separately)
  const leftSibling  = Math.max(current - siblings, 2);
  const rightSibling = Math.min(current + siblings, total - 1);

  const items: PageItem[] = [1];

  if (leftSibling > 2)         items.push('start-ellipsis');
  for (let i = leftSibling; i <= rightSibling; i++) items.push(i);
  if (rightSibling < total - 1) items.push('end-ellipsis');

  items.push(total);
  return items;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  navigationLabel = 'Pagination',
}: PaginationProps) {
  const liveId = useId();
  const pages = buildPageRange(currentPage, totalPages, siblingCount);

  return (
    <nav aria-label={navigationLabel}>
      <ol className={styles.list}>
        {/* Previous */}
        <li>
          <button
            type="button"
            className={`${styles.control} ${styles.arrow}`}
            aria-label="Previous page"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span aria-hidden="true">‹</span>
          </button>
        </li>

        {/* Page items */}
        {pages.map((item) => {
          if (item === 'start-ellipsis' || item === 'end-ellipsis') {
            return (
              <li key={item}>
                <span className={styles.ellipsis} aria-hidden="true">…</span>
              </li>
            );
          }

          const isCurrent = item === currentPage;
          return (
            <li key={item}>
              <button
                type="button"
                className={`${styles.control} ${styles.page} ${isCurrent ? styles.current : ''}`}
                aria-label={`Page ${item}`}
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => !isCurrent && onPageChange(item)}
                disabled={isCurrent}
              >
                {item}
              </button>
            </li>
          );
        })}

        {/* Next */}
        <li>
          <button
            type="button"
            className={`${styles.control} ${styles.arrow}`}
            aria-label="Next page"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span aria-hidden="true">›</span>
          </button>
        </li>
      </ol>

      {/* Polite live region — announces current position after every page change (4.1.3) */}
      <div
        id={liveId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  );
}
