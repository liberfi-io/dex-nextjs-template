"use client";

import { Skeleton } from "@heroui/react";
import { cn } from "@liberfi.io/ui";
import { useTranslation } from "@liberfi.io/i18n";
import { tKey } from "../../../../application/t";
import {
  alignClass,
  type BottomTableColumn,
} from "../../token-detail/bottom-tables/table-shell";

const ROW_COUNT = 8;

interface PortfolioAssetsTableSkeletonProps {
  columns: ReadonlyArray<BottomTableColumn>;
}

/**
 * Skeleton variant of `PortfolioAssetsTable`.
 *
 * Re-uses the same `BottomTableColumn` definitions as the live table so
 * column widths and alignments are pixel-identical — when the live table
 * mounts, rows snap into place with zero layout shift.
 *
 * The Token column shows a small circle + two-line text skeleton so the
 * row height matches the live row's 48px target.
 */
export function PortfolioAssetsTableSkeleton({
  columns,
}: PortfolioAssetsTableSkeletonProps) {
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
                            style={{ width: 60 + ((i * 13) % 30) }}
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
