"use client";

import { useTokenStatsQuery } from "@liberfi.io/react";
import type { Chain, TokenStatsByResolution } from "@liberfi.io/types";
import { cn } from "@liberfi.io/ui";
import { formatPercent, SafeBigNumber } from "@liberfi.io/utils";
import { useTranslation } from "@liberfi/ui-base";
import BigNumber from "bignumber.js";
import { useMemo, useState } from "react";

/**
 * GMGN-style compact USD formatter. Matches the precision ladder used by
 * the reference (e.g. `$0`, `$0.567`, `$42.67`, `$567`, `$2K`, `$145K`,
 * `$1M`):
 *
 *   < 0.001 → "$0"
 *   < 1     → 3 decimals (ROUND_DOWN, conservative for small fractions)
 *   < 100   → 2 decimals (ROUND_DOWN)
 *   < 1000  → 0 decimals (ROUND_DOWN)
 *   ≥ 1000  → abbreviated K / M / B / T, integer (ROUND_HALF_UP)
 *
 * The abbreviated branches deliberately drop fractional digits — once we are
 * in K / M / B territory the extra decimal becomes noise and adds visual
 * width without informational value (GMGN renders e.g. `$71K`, `$75K`, not
 * `$70.6K`, `$74.5K`). Sub-$1K values keep their cents for trader-relevant
 * precision.
 *
 * Inlined here (rather than imported from `@liberfi.io/utils`) so this file
 * compiles regardless of which utils version is resolved by the webpack
 * alias — the `formatUsdCompact` export was added in a later SDK release
 * and hot-module reloading sometimes lags behind on barrel re-exports
 * under `USE_LOCAL_SDK=true`.
 */
function formatUsdCompact(value: BigNumber.Value | undefined | null): string {
  if (value === undefined || value === null || value === "") return "$0";
  const n = new SafeBigNumber(value);
  if (n.isNaN() || !n.isFinite()) return "$0";
  const abs = n.abs();
  const sign = n.lt(0) ? "-" : "";
  if (abs.lt(0.001)) return "$0";
  if (abs.lt(1)) {
    return `${sign}$${abs.decimalPlaces(3, BigNumber.ROUND_DOWN).toString()}`;
  }
  if (abs.lt(100)) {
    return `${sign}$${abs.decimalPlaces(2, BigNumber.ROUND_DOWN).toString()}`;
  }
  if (abs.lt(1e3)) {
    return `${sign}$${abs.integerValue(BigNumber.ROUND_DOWN).toString()}`;
  }
  if (abs.lt(1e6)) {
    return `${sign}$${abs.div(1e3).integerValue(BigNumber.ROUND_HALF_UP).toString()}K`;
  }
  if (abs.lt(1e9)) {
    return `${sign}$${abs.div(1e6).integerValue(BigNumber.ROUND_HALF_UP).toString()}M`;
  }
  if (abs.lt(1e12)) {
    return `${sign}$${abs.div(1e9).integerValue(BigNumber.ROUND_HALF_UP).toString()}B`;
  }
  return `${sign}$${abs.div(1e12).integerValue(BigNumber.ROUND_HALF_UP).toString()}T`;
}

/**
 * GMGN-style compact integer formatter for transaction counts (buys / sells).
 * Examples: `2365 → 2.4K`, `1563 → 1.6K`, `567 → 567`.
 *
 *   < 1000  → integer
 *   ≥ 1000  → abbreviated K / M / B / T, 1 decimal place (round half-up)
 *
 * Uses ROUND_HALF_UP because GMGN's counters round (e.g. `2365 → 2.4K`, not
 * `2.3K`). USD values keep ROUND_DOWN above, matching the conservative
 * presentation typical of price displays.
 */
function formatCountCompact(value: BigNumber.Value | undefined | null): string {
  if (value === undefined || value === null || value === "") return "0";
  const n = new SafeBigNumber(value);
  if (n.isNaN() || !n.isFinite()) return "0";
  const abs = n.abs();
  const sign = n.lt(0) ? "-" : "";
  if (abs.lt(1e3)) {
    return `${sign}${abs.integerValue(BigNumber.ROUND_DOWN).toString()}`;
  }
  if (abs.lt(1e6)) {
    return `${sign}${abs.div(1e3).decimalPlaces(1, BigNumber.ROUND_HALF_UP).toString()}K`;
  }
  if (abs.lt(1e9)) {
    return `${sign}${abs.div(1e6).decimalPlaces(1, BigNumber.ROUND_HALF_UP).toString()}M`;
  }
  if (abs.lt(1e12)) {
    return `${sign}${abs.div(1e9).decimalPlaces(1, BigNumber.ROUND_HALF_UP).toString()}B`;
  }
  return `${sign}${abs.div(1e12).decimalPlaces(1, BigNumber.ROUND_HALF_UP).toString()}T`;
}

/**
 * Time window resolutions exposed in the volume-stats tab strip.
 * Mirrors GMGN's `1m / 5m / 1h / 24h` selector.
 */
const RESOLUTIONS = ["1m", "5m", "1h", "24h"] as const;
type Resolution = (typeof RESOLUTIONS)[number];

const DEFAULT_RESOLUTION: Resolution = "1h";

export interface SidebarVolumeStatsProps {
  chain: Chain;
  address: string;
}

/**
 * Right-sidebar volume-stats block, modelled on GMGN.
 *
 * Layout:
 *
 *   ┌── tab strip (1m / 5m / 1h / 24h) ───────────────────────┐
 *   │   each cell: label + price-change % (bullish/bearish)   │
 *   └─────────────────────────────────────────────────────────┘
 *   ┌── data row (4 columns) ─────────────────────────────────┐
 *   │  Volume         Buys n/$         Sells n/$    Net ±$    │
 *   └─────────────────────────────────────────────────────────┘
 *
 * Clicking a tab swaps the bottom data row to that resolution. The active
 * tab gets a subtle `bg-content3` highlight and `font-semibold` label;
 * inactive tabs show `text-default-700` on a transparent track and reveal
 * the same highlight on hover.
 */
export function SidebarVolumeStats({ chain, address }: SidebarVolumeStatsProps) {
  const { t } = useTranslation();
  const { data: stats } = useTokenStatsQuery({ chain, address });
  const [active, setActive] = useState<Resolution>(DEFAULT_RESOLUTION);
  const slice = stats?.[active];

  return (
    <div className="flex flex-col gap-3 border-b border-divider p-3">
      {/* Tab strip — one cell per resolution */}
      <div className="flex items-center gap-0.5 rounded-md bg-content2 p-0.5">
        {RESOLUTIONS.map((res) => (
          <ResolutionTab
            key={res}
            resolution={res}
            isActive={active === res}
            stat={stats?.[res]}
            onSelect={setActive}
          />
        ))}
      </div>

      {/* Data row — 4 stats for the active resolution */}
      <DataRow
        slice={slice}
        labels={{
          volume: t("extend.trade.volume.total"),
          buys: t("extend.trade.transactions.buys"),
          sales: t("extend.trade.transactions.sales"),
          netBuys: t("extend.trade.transactions.net_buys"),
        }}
      />
    </div>
  );
}

function ResolutionTab({
  resolution,
  isActive,
  stat,
  onSelect,
}: {
  resolution: Resolution;
  isActive: boolean;
  stat: TokenStatsByResolution | undefined;
  onSelect: (r: Resolution) => void;
}) {
  const priceChange = stat?.priceChange;
  const bullish = useMemo(
    () => priceChange === undefined || new SafeBigNumber(priceChange).gte(0),
    [priceChange],
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(resolution)}
      className={cn(
        "flex h-[46px] flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md transition-colors",
        isActive ? "bg-content3" : "hover:bg-content3/60",
      )}
    >
      <span
        className={cn(
          "text-[13px] leading-4",
          isActive
            ? "font-semibold text-foreground"
            : "font-normal text-default-700",
        )}
      >
        {resolution}
      </span>
      <span
        className={cn(
          "text-[13px] font-medium leading-4 tabular-nums",
          bullish ? "text-bullish" : "text-bearish",
        )}
      >
        {priceChange !== undefined
          ? formatPercent(priceChange, { showPlusGtThanZero: true })
          : "-"}
      </span>
    </button>
  );
}

function DataRow({
  slice,
  labels,
}: {
  slice: TokenStatsByResolution | undefined;
  labels: { volume: string; buys: string; sales: string; netBuys: string };
}) {
  const buyVolume = slice?.buyVolumesInUsd;
  const sellVolume = slice?.sellVolumesInUsd;

  // net = buyVolumesInUsd - sellVolumesInUsd; bullish when buys outweigh sells
  const net = useMemo(() => {
    if (buyVolume === undefined || sellVolume === undefined) return undefined;
    return new SafeBigNumber(buyVolume).minus(sellVolume);
  }, [buyVolume, sellVolume]);
  const netBullish = !net || net.gte(0);

  return (
    <div className="flex items-center text-[13px] leading-4 text-default-700">
      {/* Volume — left aligned */}
      <Cell align="left" label={labels.volume}>
        <span className="text-foreground">
          {formatUsdCompact(slice?.volumesInUsd ?? "")}
        </span>
      </Cell>

      {/* Buys — count + volume, both in bullish */}
      <Cell label={labels.buys}>
        <span className="text-bullish">
          {formatCountCompact(slice?.buys ?? "")}
        </span>
        <span className="text-default-700">/</span>
        <span className="text-bullish">
          {formatUsdCompact(slice?.buyVolumesInUsd ?? "")}
        </span>
      </Cell>

      {/* Sells — count + volume, both in bearish */}
      <Cell label={labels.sales}>
        <span className="text-bearish">
          {formatCountCompact(slice?.sells ?? "")}
        </span>
        <span className="text-default-700">/</span>
        <span className="text-bearish">
          {formatUsdCompact(slice?.sellVolumesInUsd ?? "")}
        </span>
      </Cell>

      {/* Net Buy — right aligned, bullish/bearish */}
      <Cell align="right" label={labels.netBuys}>
        <span className={cn(netBullish ? "text-bullish" : "text-bearish")}>
          {net !== undefined
            ? `${netBullish ? "+" : "-"}${formatUsdCompact(net.abs().toString())}`
            : "-"}
        </span>
      </Cell>
    </div>
  );
}

function Cell({
  label,
  children,
  align = "center",
}: {
  label: string;
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-0.5",
        align === "left" && "items-start text-left",
        align === "right" && "items-end text-right",
        align === "center" && "items-center text-center",
      )}
    >
      <span>{label}</span>
      <span
        className="text-[12px] font-medium tabular-nums"
        style={{ letterSpacing: "-0.2px" }}
      >
        {children}
      </span>
    </div>
  );
}
