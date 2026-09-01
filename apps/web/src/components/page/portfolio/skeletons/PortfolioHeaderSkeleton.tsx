"use client";

import { Skeleton } from "@heroui/react";
import { cn } from "@liberfi.io/ui";

/**
 * Skeleton placeholder for `PortfolioHeader`.
 *
 * Layout dimensions are kept identical to the final header so the
 * transition from skeleton → real content does not shift the rest of
 * the page (no CLS):
 *   - Outer container: same padding + border + rounded radius +
 *     `flex-col gap-5` so the actions stack underneath the info block.
 *   - Top row: 56×56 avatar + (address / balance / PnL lines).
 *   - Action row: 3 chips matching the live ActionButton dimensions.
 */
export function PortfolioHeaderSkeleton() {
  return (
    <div
      className={cn(
        "w-full flex flex-col gap-5",
        "p-5 lg:p-6 rounded-2xl border border-default-100 bg-content1",
      )}
    >
      <div className="flex items-start gap-4 min-w-0">
        <Skeleton className="rounded-2xl shrink-0">
          <div className="h-14 w-14" />
        </Skeleton>
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          {/* Address row */}
          <div className="flex items-center gap-2">
            <Skeleton className="rounded">
              <div className="h-3 w-28" />
            </Skeleton>
            <Skeleton className="ml-auto rounded-md">
              <div className="h-7 w-7" />
            </Skeleton>
          </div>
          <Skeleton className="rounded">
            <div className="h-9 w-36" />
          </Skeleton>
          <Skeleton className="rounded">
            <div className="h-3.5 w-28" />
          </Skeleton>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 pt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-xl px-3 py-2"
          >
            <Skeleton className="rounded-full">
              <div className="h-10 w-10" />
            </Skeleton>
            <Skeleton className="rounded">
              <div className="h-3 w-10" />
            </Skeleton>
          </div>
        ))}
      </div>
    </div>
  );
}
