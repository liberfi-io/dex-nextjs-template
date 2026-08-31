"use client";

import { Skeleton } from "@heroui/react";
import { PortfolioAllocationChartSkeleton } from "./PortfolioAllocationChartSkeleton";
import { PortfolioHeaderSkeleton } from "./PortfolioHeaderSkeleton";

const ROW_COUNT = 8;

/**
 * Full-page loading state that mirrors the current portfolio composition.
 * Keeping the same card grid and bottom-panel dimensions prevents a large
 * layout shift when authentication and portfolio data finish loading.
 */
export function PortfolioPageSkeleton() {
  return (
    <div data-testid="portfolio-page-skeleton" className="relative h-full w-full">
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 opacity-[0.07]"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--color-brand-primary) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-[1] mx-auto flex h-full w-full max-w-[1280px] flex-col gap-4 overflow-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div data-testid="portfolio-header-skeleton" className="contents">
            <PortfolioHeaderSkeleton />
          </div>
          <div data-testid="portfolio-allocation-skeleton" className="contents">
            <PortfolioAllocationChartSkeleton />
          </div>
        </div>

        <div
          data-testid="portfolio-bottom-panel-skeleton"
          className="flex min-h-[480px] flex-1 flex-col overflow-hidden rounded-2xl border border-default-100 bg-content1"
        >
          <div className="flex items-center gap-2 border-b border-default-100 px-3 py-2">
            <Skeleton className="rounded-full">
              <div className="h-7 w-16" />
            </Skeleton>
            <Skeleton className="rounded-full">
              <div className="h-7 w-20" />
            </Skeleton>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden px-2 pb-2 lg:px-3">
            <div
              data-testid="portfolio-table-header-skeleton"
              className="flex h-9 items-center gap-6 px-3"
            >
              {["w-24", "w-16", "w-20", "w-14", "w-16", "w-20"].map(
                (width, index) => (
                  <Skeleton key={index} className="flex-1 rounded">
                    <div className={`h-3 ${width}`} />
                  </Skeleton>
                ),
              )}
            </div>
            {Array.from({ length: ROW_COUNT }, (_, rowIndex) => (
              <div
                key={rowIndex}
                className="flex h-12 items-center gap-6 border-b border-border-subtle/30 px-3"
              >
                <div className="flex min-w-28 flex-1 items-center gap-2">
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
                {[0, 1, 2, 3, 4].map((columnIndex) => (
                  <Skeleton key={columnIndex} className="flex-1 rounded">
                    <div className="ml-auto h-3 w-14" />
                  </Skeleton>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
