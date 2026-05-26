"use client";

import { cn, Spinner } from "@liberfi.io/ui";
import { useTranslation } from "@liberfi/ui-base";
import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * Single column definition for {@link TableShell}. Mirrors GMGN's
 * activity / holders tables: each column has a fixed % width, an
 * alignment, and a translation-key label.
 */
export interface BottomTableColumn {
  /** Unique key — used for React reconciliation. */
  key: string;
  /** Translation key for the column header (full i18n path). */
  labelKey: string;
  /** Tailwind width class — e.g. `w-[10%]` or `w-[120px]`. */
  width: string;
  /** Horizontal alignment of header + body cells. */
  align?: "left" | "right" | "center";
}

/**
 * Infinite-scroll configuration. When provided, {@link TableShell} renders
 * a sentinel row at the bottom of the table that observes the scroll
 * container; once it scrolls into view, `onLoadMore` fires automatically.
 *
 * The shell also surfaces a spinner inside the sentinel row while
 * `isLoading` is true, so callers don't need a separate loading row.
 */
export interface InfiniteScrollConfig {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export interface TableShellProps {
  columns: ReadonlyArray<BottomTableColumn>;
  /** Min-width of the inner table; required to keep wide layouts intact when
   *  the panel is narrow. Use a px value like `min-w-[820px]`. */
  minWidth: string;
  /** Optional toolbar row above the header (e.g. filter / sort chips). */
  toolbar?: ReactNode;
  /** Body content — caller renders rows. */
  children: ReactNode;
  /** Enable IntersectionObserver-driven auto-load-more + spinner state. */
  infiniteScroll?: InfiniteScrollConfig;
  /** Show a centred spinner while the first page is loading (no rows yet). */
  isInitialLoading?: boolean;
  className?: string;
}

/**
 * GMGN-style table chrome (head + scroll container). The header is sticky
 * so it stays visible as the body scrolls. All visual tokens (font sizes,
 * borders, colors) match the design reference §7:
 *
 * - header: 36px, text-default-500, 12px / 500
 * - body row: 40px, border-bottom default-50, hover bg-default-50/60
 * - column heads: aligned per column spec, right-aligned for numerics
 *
 * The caller passes column definitions and renders its own rows; we keep
 * this component dumb so each table can tailor its row rendering without
 * paying for a generic data-grid abstraction.
 *
 * When `infiniteScroll` is supplied, the shell takes ownership of the
 * pagination trigger: it renders a hidden sentinel row at the bottom of
 * the table and uses IntersectionObserver against its own scroll
 * container to fire `onLoadMore` automatically. The spinner row is shown
 * in the same slot while `isLoading` is true.
 */
export function TableShell({
  columns,
  minWidth,
  toolbar,
  children,
  infiniteScroll,
  isInitialLoading,
  className,
}: TableShellProps) {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {toolbar ? (
        <div className="flex items-center gap-2 border-b border-default-100 px-3 py-2">
          {toolbar}
        </div>
      ) : null}
      <div
        ref={scrollContainerRef}
        className="custom-scrollbar min-h-0 flex-1 overflow-auto"
      >
        <table
          className={cn(
            "w-full table-fixed border-collapse text-[12px]",
            minWidth,
          )}
        >
          <thead className="sticky top-0 z-10 bg-content1">
            <tr className="border-b border-divider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "h-9 px-3 align-middle text-[12px] font-medium text-default-500",
                    alignClass(col.align),
                    col.width,
                  )}
                  style={{ letterSpacing: "-0.2px" }}
                >
                  {t(col.labelKey)}
                </th>
              ))}
            </tr>
          </thead>
          {children}
          {infiniteScroll && (infiniteScroll.hasMore || infiniteScroll.isLoading) ? (
            <InfiniteScrollSentinel
              colSpan={columns.length}
              rootRef={scrollContainerRef}
              {...infiniteScroll}
            />
          ) : null}
        </table>
        {isInitialLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size="sm" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Stable empty-state body. Used by {@link EmptyTable} as well as by data
 * tables when the result set is empty.
 */
export function EmptyBody({
  colSpan,
  messageKey,
}: {
  colSpan: number;
  messageKey?: string;
}) {
  const { t } = useTranslation();
  return (
    <tbody>
      <tr>
        <td
          colSpan={colSpan}
          className="py-16 text-center text-[12px] text-default-500"
        >
          {t(messageKey ?? "extend.trade.bottom_panel.no_data")}
        </td>
      </tr>
    </tbody>
  );
}

/**
 * Bottom-of-table sentinel that triggers `onLoadMore` once it intersects
 * the scroll container. Lives inside its own `<tbody>` so it never
 * interferes with the row reconciliation of the parent table.
 *
 * IntersectionObserver setup:
 *   - `root` = the scroll container (passed in by ref).
 *   - `rootMargin = 200px` — pre-fetches the next page slightly before
 *     the user reaches the visual bottom, hiding network latency.
 *   - Re-observes whenever `hasMore` flips back to `true` (e.g. after a
 *     filter change resets the cursor).
 *
 * Guard against re-entrant loads while `isLoading` is true: a single
 * `onLoadMore` call per IntersectionObserver fire is enough — the
 * subsequent re-render that flips `isLoading` to `true` will guard
 * further calls via the closure capture.
 */
function InfiniteScrollSentinel({
  colSpan,
  rootRef,
  hasMore,
  isLoading,
  onLoadMore,
}: {
  colSpan: number;
  rootRef: React.RefObject<HTMLDivElement | null>;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}) {
  const sentinelRef = useRef<HTMLTableRowElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  // Stable callback referenced by IntersectionObserver. Reads `hasMore`
  // and `isLoading` via state mirrors to avoid re-instantiating the
  // observer every render.
  const [shouldObserve, setShouldObserve] = useState(hasMore && !isLoading);
  useEffect(() => {
    setShouldObserve(hasMore && !isLoading);
  }, [hasMore, isLoading]);

  const fire = useCallback(() => {
    if (!hasMore || isLoading) return;
    onLoadMoreRef.current();
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (!shouldObserve) return;
    const node = sentinelRef.current;
    const root = rootRef.current;
    if (!node || !root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) fire();
      },
      { root, rootMargin: "200px 0px 200px 0px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldObserve, fire, rootRef]);

  return (
    <tbody>
      <tr ref={sentinelRef}>
        <td colSpan={colSpan} className="h-10 align-middle">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-[12px] text-default-500">
              <Spinner size="sm" />
            </div>
          ) : (
            <span aria-hidden className="block h-px w-px" />
          )}
        </td>
      </tr>
    </tbody>
  );
}

/** Map column alignment to the matching Tailwind text-align utility. */
export function alignClass(align: BottomTableColumn["align"]) {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}
