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
 *     `flex-col gap-4` so the actions stack underneath the info block.
 *   - Top row: 56×56 avatar + (address line / balance+PnL line).
 *   - Action row: 3 chips matching the live ActionButton dimensions.
 */
export function PortfolioHeaderSkeleton() {
  return (
    <div
      className={cn(
        "w-full flex flex-col gap-4",
        "p-4 lg:p-5 rounded-2xl border border-default-100 bg-content1",
      )}
    >
      <div className="flex items-start gap-4 min-w-0">
        <Skeleton className="rounded-2xl shrink-0">
          <div className="h-14 w-14" />
        </Skeleton>
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          {/* Address row */}
          <Skeleton className="rounded">
            <div className="h-3 w-28" />
          </Skeleton>
          {/* Balance + PnL row — wider placeholder spans both pieces */}
          <div className="flex items-baseline gap-3">
            <Skeleton className="rounded">
              <div className="h-7 w-44" />
            </Skeleton>
            <Skeleton className="rounded">
              <div className="h-3.5 w-24" />
            </Skeleton>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-around">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1.5 px-3 py-1"
          >
            <Skeleton className="rounded-full">
              <div className="h-9 w-9" />
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
