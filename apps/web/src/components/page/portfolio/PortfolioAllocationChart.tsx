"use client";

import { useCallback, useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import { useWalletPortfoliosQuery } from "@liberfi.io/react";
import type { Chain, Portfolio } from "@liberfi.io/types";
import { cn, EmptyIcon } from "@liberfi.io/ui";
import { formatPercent } from "@liberfi.io/utils";
import { useTranslation } from "@liberfi/ui-base";
import { formatAmountInUsd } from "@liberfi.io/utils";

/**
 * Maximum number of named slices in the allocation pie. Anything beyond this
 * is collapsed into a single "Others" slice so the chart stays legible even
 * for wallets holding hundreds of dust positions.
 */
const MAX_SLICES = 8;

/**
 * Brand-tinted palette aligned with the AxiomTrade dashboard. We reuse a
 * stable index so the same token always gets the same color across renders
 * (top-by-value ordering is deterministic on the same data set).
 */
const ALLOCATION_COLORS = [
  "#bcff2e",
  "#f76816",
  "#9353d3",
  "#f31260",
  "#006FEE",
  "#14b8a6",
  "#eab308",
  "#c026d3",
  "#737373", // reserved for the "Others" bucket
];

const OTHERS_COLOR = ALLOCATION_COLORS[ALLOCATION_COLORS.length - 1];

interface AllocationSlice {
  key: string;
  name: string;
  value: number;
  formattedValue: string;
  formattedPercentage: string;
  color: string;
}

export interface PortfolioAllocationChartProps {
  chain: Chain;
  address: string;
  className?: string;
}

/**
 * Token-allocation pie chart for the portfolio page.
 *
 * Data is sourced from `/v2/wallet/{chain}/{wallet}/net-worth` (via
 * `useWalletPortfoliosQuery`). The `PortfolioProvider` already polls a
 * single page of net-worth every 15s for the wallet summary, but this
 * widget needs the *list* of holdings — the underlying React Query cache is
 * the same key, so this hook re-uses that cache rather than triggering a
 * second network round-trip.
 *
 * Falls back to an empty-state placeholder when the wallet has no holdings
 * or the address is missing.
 */
export function PortfolioAllocationChart({
  chain,
  address,
  className,
}: PortfolioAllocationChartProps) {
  const { t } = useTranslation();
  const enabled = !!address;
  const { data, isPending } = useWalletPortfoliosQuery(
    { chain, address, limit: 100 },
    { enabled },
  );

  const slices = useMemo<AllocationSlice[]>(() => {
    if (!data) return [];
    return computeAllocationSlices(data.portfolios);
  }, [data]);

  const [activeIndex, setActiveIndex] = useState(0);

  const handleEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  if (!enabled) {
    return (
      <ChartShell className={className}>
        <EmptyState message={t("extend.portfolio.allocation.noWallet")} />
      </ChartShell>
    );
  }

  if (isPending && !data) {
    return (
      <ChartShell className={className}>
        <PortfolioAllocationChartLoadingBody />
      </ChartShell>
    );
  }

  if (slices.length === 0) {
    return (
      <ChartShell className={className}>
        <EmptyState message={t("extend.portfolio.allocation.noHoldings")} />
      </ChartShell>
    );
  }

  return (
    <ChartShell className={className}>
      <div className="flex h-full w-full items-center gap-4 lg:gap-6">
        {/* Pie */}
        <div className="relative h-[200px] w-[200px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                data={slices}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={78}
                paddingAngle={2}
                stroke="none"
                onMouseEnter={handleEnter}
                activeShape={ActiveSlice}
              >
                {slices.map((slice) => (
                  <Cell
                    key={slice.key}
                    fill={slice.color}
                    stroke={slice.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <ul className="flex flex-1 min-w-0 flex-col gap-1.5">
          {slices.map((slice, index) => (
            <li key={slice.key}>
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left transition-colors cursor-pointer",
                  index === activeIndex
                    ? "bg-default-100"
                    : "hover:bg-default-50",
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate text-xs font-medium text-foreground">
                    {slice.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-default-400 tabular-nums">
                    {slice.formattedPercentage}
                  </span>
                </span>
                <span className="text-xs tabular-nums text-default-500">
                  {slice.formattedValue}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </ChartShell>
  );
}

/** Container shared by the chart, loading, and empty states. */
function ChartShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <section
      className={cn(
        "w-full flex flex-col rounded-2xl border border-default-100 bg-content1 p-4 lg:p-5",
        className,
      )}
    >
      <h2 className="mb-3 text-sm font-medium text-default-500">
        {t("extend.portfolio.allocation.title")}
      </h2>
      <div className="min-h-[200px] flex-1">{children}</div>
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 py-6 text-default-400">
      <EmptyIcon width={36} height={36} />
      <span className="text-xs">{message}</span>
    </div>
  );
}

/** Renders when the chart is loading and there is no cached data yet. */
export function PortfolioAllocationChartLoadingBody() {
  return (
    <div className="flex h-full w-full items-center gap-4 lg:gap-6 animate-pulse">
      <div className="relative h-[200px] w-[200px] shrink-0 rounded-full border-[16px] border-default-100" />
      <ul className="flex flex-1 min-w-0 flex-col gap-2">
        {[...Array(5)].map((_, i) => (
          <li
            key={i}
            className="flex items-center gap-2 rounded-md px-2 py-1.5"
          >
            <span className="h-2 w-2 rounded-full bg-default-200" />
            <span className="h-3 w-20 rounded bg-default-200" />
            <span className="h-3 w-12 rounded bg-default-100 ml-auto" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Highlighted-slice renderer. Pulls the active slice slightly outward. */
function ActiveSlice(props: PieSectorDataItem) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={(innerRadius ?? 0) - 2}
      outerRadius={(outerRadius ?? 0) + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

/**
 * Build allocation slices from the raw `Portfolio` list.
 *
 * Steps:
 *   1. Filter out zero-value rows (defensive — net-worth already filters
 *      most of them, but stale streams can leak through).
 *   2. Sort descending by USD value.
 *   3. Take the top `MAX_SLICES - 1`; aggregate the tail into a single
 *      `Others` slice. Skipped when there are fewer than `MAX_SLICES`
 *      holdings, in which case all holdings get their own slice.
 *   4. Compute percentages against the total of the kept slices.
 */
function computeAllocationSlices(
  portfolios: ReadonlyArray<Portfolio>,
): AllocationSlice[] {
  const positive = portfolios
    .map((p) => ({ portfolio: p, value: parseFloat(p.amountInUsd ?? "0") }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);

  if (positive.length === 0) return [];

  const total = positive.reduce((acc, row) => acc + row.value, 0);
  if (total <= 0) return [];

  const head = positive.slice(0, MAX_SLICES - 1);
  const tail = positive.slice(MAX_SLICES - 1);

  const slices: AllocationSlice[] = head.map((row, index) => ({
    key: row.portfolio.address || `slice-${index}`,
    name: row.portfolio.symbol || row.portfolio.name || "—",
    value: row.value,
    formattedValue: formatAmountInUsd(row.value),
    formattedPercentage: formatPercent(row.value / total),
    color: ALLOCATION_COLORS[index % (ALLOCATION_COLORS.length - 1)],
  }));

  if (tail.length > 0) {
    const tailValue = tail.reduce((acc, row) => acc + row.value, 0);
    slices.push({
      key: "__others__",
      name: "Others",
      value: tailValue,
      formattedValue: formatAmountInUsd(tailValue),
      formattedPercentage: formatPercent(tailValue / total),
      color: OTHERS_COLOR,
    });
  }

  return slices;
}
