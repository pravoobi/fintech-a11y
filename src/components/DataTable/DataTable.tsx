import { useId, useState, useEffect, useRef } from 'react';
import styles from './DataTable.module.css';

export interface DataTableColumn {
  /** Unique key matching a property on DataTableRow. */
  key: string;
  /** Visible column heading. */
  label: string;
  /** Whether this column is sortable. Defaults to false. */
  sortable?: boolean;
  /** Optional alignment for cells in this column. Defaults to 'left'. */
  align?: 'left' | 'right' | 'center';
}

export interface DataTableRow {
  /** Unique identifier used as the React key. */
  id: string | number;
  [key: string]: unknown;
}

export type SortDirection = 'ascending' | 'descending';

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface DataTableProps {
  /** Visible <caption> — the table's accessible name (1.3.1). */
  caption: string;
  /** Column definitions. */
  columns: DataTableColumn[];
  /** Row data. Each row must have a unique `id`. */
  rows: DataTableRow[];
  /**
   * Controlled sort state. When provided the table is fully controlled —
   * the caller is responsible for sorting `rows` before passing them in.
   */
  sortState?: SortState;
  /** Called when the user activates a sort button. */
  onSort?: (sort: SortState) => void;
}

function SortIcon({ direction }: { direction: SortDirection | null }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      className={styles.sortIcon}
    >
      {/* Up arrow — highlighted when ascending */}
      <path
        d="M8 3L5 7h6L8 3z"
        fill={direction === 'ascending' ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        opacity={direction === 'descending' ? 0.35 : 1}
      />
      {/* Down arrow — highlighted when descending */}
      <path
        d="M8 13l3-4H5l3 4z"
        fill={direction === 'descending' ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        opacity={direction === 'ascending' ? 0.35 : 1}
      />
    </svg>
  );
}

export function DataTable({
  caption,
  columns,
  rows,
  sortState,
  onSort,
}: DataTableProps) {
  const liveRegionId = useId();

  // Internal sort state used when the component is uncontrolled
  const [internalSort, setInternalSort] = useState<SortState | null>(null);
  const activeSort = sortState ?? internalSort;

  // Announcement text for the live region — only populated after the first sort
  const [announcement, setAnnouncement] = useState('');
  // Track whether this is the initial render so we don't announce on mount
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (activeSort) {
      const col = columns.find((c) => c.key === activeSort.key);
      if (col) {
        setAnnouncement(`Sorted by ${col.label}, ${activeSort.direction}`);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSort?.key, activeSort?.direction]);

  function handleSort(key: string) {
    const currentDirection =
      activeSort?.key === key ? activeSort.direction : null;
    const nextDirection: SortDirection =
      currentDirection === 'ascending' ? 'descending' : 'ascending';
    const next: SortState = { key, direction: nextDirection };

    if (onSort) {
      onSort(next);
    } else {
      setInternalSort(next);
    }
  }

  // When uncontrolled, sort rows internally
  const displayRows =
    !sortState && internalSort
      ? [...rows].sort((a, b) => {
          const aVal = a[internalSort.key];
          const bVal = b[internalSort.key];
          const cmp =
            typeof aVal === 'number' && typeof bVal === 'number'
              ? aVal - bVal
              : String(aVal ?? '').localeCompare(String(bVal ?? ''));
          return internalSort.direction === 'ascending' ? cmp : -cmp;
        })
      : rows;

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableContainer} role="region" aria-label={caption} tabIndex={0}>
        <table className={styles.table}>
          <caption className={styles.caption}>{caption}</caption>
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = activeSort?.key === col.key;
                const ariaSort = col.sortable
                  ? isSorted
                    ? activeSort!.direction
                    : 'none'
                  : undefined;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={`${styles.th} ${col.align === 'right' ? styles.alignRight : col.align === 'center' ? styles.alignCenter : ''}`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        className={`${styles.sortButton} ${isSorted ? styles.sortButtonActive : ''}`}
                        onClick={() => handleSort(col.key)}
                      >
                        <span>{col.label}</span>
                        <SortIcon direction={isSorted ? activeSort!.direction : null} />
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => (
              <tr key={row.id} className={styles.tr}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`${styles.td} ${col.align === 'right' ? styles.alignRight : col.align === 'center' ? styles.alignCenter : ''}`}
                  >
                    {String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Persistent polite live region — announces sort changes without focus move (4.1.3) */}
      <div
        id={liveRegionId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles.srOnly}
      >
        {announcement}
      </div>
    </div>
  );
}
