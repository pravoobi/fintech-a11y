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
  /** Enables the checkbox selection column. */
  selectable?: boolean;
  /** Controlled array of selected row IDs. */
  selectedRows?: (string | number)[];
  /** Fires with the updated array of selected IDs on every change. */
  onSelectionChange?: (ids: (string | number)[]) => void;
  /**
   * Returns a human-readable label for a row — used for checkbox accessible
   * names ("Select Alice Johnson"). Defaults to `String(row.id)`.
   */
  getRowLabel?: (row: DataTableRow) => string;
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
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowLabel,
}: DataTableProps) {
  const liveRegionId = useId();

  const [internalSort, setInternalSort] = useState<SortState | null>(null);
  const activeSort = sortState ?? internalSort;

  const [announcement, setAnnouncement] = useState('');
  const isMounted = useRef(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Announce sort changes (4.1.3)
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

  // ─── Row selection ─────────────────────────────────────────────────────────

  const selectedSet = new Set(selectedRows);
  const allIds = displayRows.map((r) => r.id);
  const selectedCount = allIds.filter((id) => selectedSet.has(id)).length;
  const isAllSelected = allIds.length > 0 && selectedCount === allIds.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < allIds.length;

  // Set the indeterminate DOM property — cannot be done via JSX (4.1.2)
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  function handleSelectAll() {
    if (isAllSelected || isIndeterminate) {
      onSelectionChange?.([]);
      setAnnouncement('No rows selected.');
    } else {
      onSelectionChange?.(allIds);
      setAnnouncement(`All ${allIds.length} rows selected.`);
    }
  }

  function handleRowSelect(row: DataTableRow) {
    const id = row.id;
    const label = getRowLabel ? getRowLabel(row) : String(id);
    let next: (string | number)[];
    let msg: string;

    if (selectedSet.has(id)) {
      next = selectedRows.filter((v) => v !== id);
      msg = `${label} deselected. ${next.length} row${next.length !== 1 ? 's' : ''} selected.`;
    } else {
      next = [...selectedRows, id];
      msg = `${label} selected. ${next.length} row${next.length !== 1 ? 's' : ''} selected.`;
    }

    onSelectionChange?.(next);
    setAnnouncement(msg);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableContainer} role="region" aria-label={caption} tabIndex={0}>
        <table className={styles.table}>
          <caption className={styles.caption}>{caption}</caption>
          <thead>
            <tr>
              {selectable && (
                <th scope="col" className={`${styles.th} ${styles.checkboxCell}`}>
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    className={styles.rowCheckbox}
                    checked={isAllSelected}
                    aria-label={isAllSelected ? 'Deselect all rows' : 'Select all rows'}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
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
            {displayRows.map((row) => {
              const isSelected = selectedSet.has(row.id);
              const label = getRowLabel ? getRowLabel(row) : String(row.id);

              return (
                <tr
                  key={row.id}
                  className={`${styles.tr}${isSelected ? ` ${styles.trSelected}` : ''}`}
                >
                  {selectable && (
                    <td className={`${styles.td} ${styles.checkboxCell}`}>
                      <input
                        type="checkbox"
                        className={styles.rowCheckbox}
                        checked={isSelected}
                        aria-label={`${isSelected ? 'Deselect' : 'Select'} ${label}`}
                        onChange={() => handleRowSelect(row)}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${styles.td} ${col.align === 'right' ? styles.alignRight : col.align === 'center' ? styles.alignCenter : ''}`}
                    >
                      {String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Persistent polite live region — announces sort + selection changes (4.1.3) */}
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
