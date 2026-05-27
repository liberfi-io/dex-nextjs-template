"use client";

import { Skeleton } from "@heroui/react";

/**
 * Standalone skeleton block for `PortfolioAllocationChart`.
 *
 * The chart component handles its own loading state internally
 * (`PortfolioAllocationChartLoadingBody`) and can therefore reuse the same
 * `ChartShell` wrapper for consistent height. This file exists so other
 * call sites (e.g. an embedded preview) that don't have the chart's
 * internal context can drop in a matching skeleton.
 */
export function PortfolioAllocationChartSkeleton() {
  return (
    <section className="w-full flex flex-col rounded-2xl border border-default-100 bg-content1 p-4 lg:p-5">
      <Skeleton className="rounded mb-3">
        <div className="h-3.5 w-24" />
      </Skeleton>

      <div className="min-h-[220px] flex-1 flex items-center gap-4 lg:gap-6">
        {/* Pie outline */}
        <div className="relative h-[200px] w-[200px] shrink-0 rounded-full">
          <Skeleton className="absolute inset-0 rounded-full">
            <div className="h-[200px] w-[200px]" />
          </Skeleton>
          {/* Donut hole */}
          <div className="absolute inset-[32px] rounded-full bg-content1" />
        </div>

        {/* Legend */}
        <ul className="flex flex-1 min-w-0 flex-col gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 px-2 py-1.5"
            >
              <span className="flex items-center gap-2">
                <Skeleton className="rounded-full">
                  <div className="h-2 w-2" />
                </Skeleton>
                <Skeleton className="rounded">
                  <div className="h-3 w-20" />
                </Skeleton>
                <Skeleton className="rounded">
                  <div className="h-2.5 w-10" />
                </Skeleton>
              </span>
              <Skeleton className="rounded">
                <div className="h-3 w-14" />
              </Skeleton>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
