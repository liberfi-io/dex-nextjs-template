"use client";

import { PortfolioAllocationChartSkeleton } from "../PortfolioAllocationChart";
import { PortfolioBottomPanelSkeleton } from "../PortfolioBottomPanel";
import { PortfolioHeaderSkeleton } from "./PortfolioHeaderSkeleton";

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

        <div className="min-h-[480px] flex-1">
          <PortfolioBottomPanelSkeleton />
        </div>
      </div>
    </div>
  );
}
