"use client";

import { Skeleton } from "@heroui/react";
import { cn } from "@liberfi.io/ui";
import { useTranslation } from "@liberfi.io/i18n";
import { tKey } from "../../../../application/t";
import {
  alignClass,
  type BottomTableColumn,
} from "../../token-detail/bottom-tables/table-shell";

const ROW_COUNT = 10;

interface PortfolioActivitiesTableSkeletonProps {
  columns: ReadonlyArray<BottomTableColumn>;
}

/**
 * Skeleton variant of `PortfolioActivitiesTable`. Renders the same column
 * widths and alignment as the live table so when real data lands the
 * activity rows replace the skeleton without any layout shift.
 *
 * Activity rows are usually denser than asset rows, so we render 10 ghost
 * rows (vs 8 in the assets skeleton) — this is a closer approximation of
 * the typical first paint and avoids the panel feeling under-filled
 * during the initial network round-trip.
 */
export function PortfolioActivitiesTableSkeleton({
  columns,
}: PortfolioActivitiesTableSkeletonProps) {
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col">
      <div className="custom-scrollbar min-h-0 flex-1 overflow-auto">
        <table className="w-full table-fixed border-collapse text-[12px] min-w-[820px]">
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
                  {tKey(t, col.labelKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROW_COUNT }, (_, i) => (
              <tr key={i} className="h-12 border-b border-default-50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("px-3 align-middle", alignClass(col.align))}
                  >
                    {col.key === "token" ? (
                      <div className="flex items-center gap-2">
                        <Skeleton className="rounded-full">
                          <div className="h-6 w-6" />
                        </Skeleton>
                        <div className="flex flex-col gap-1">
                          <Skeleton className="rounded">
                            <div className="h-3 w-14" />
                          </Skeleton>
                          <Skeleton className="rounded">
                            <div className="h-2.5 w-20" />
                          </Skeleton>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "flex",
                          col.align === "right"
                            ? "justify-end"
                            : col.align === "center"
                              ? "justify-center"
                              : "justify-start",
                        )}
                      >
                        <Skeleton className="rounded">
                          <div
                            className="h-3"
                            style={{
                              width:
                                col.key === "tx"
                                  ? 64
                                  : col.key === "age"
                                    ? 28
                                    : 56 + ((i * 7) % 24),
                            }}
                          />
                        </Skeleton>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
