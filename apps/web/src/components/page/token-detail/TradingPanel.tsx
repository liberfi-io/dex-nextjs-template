import { InstantTrade } from "@liberfi/ui-dex/components/trade";

function PositionStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1">
      <span className="text-xs font-normal leading-4 text-default-500">
        {label}
      </span>
      <div className="flex flex-row items-center gap-1">
        <span className={`text-xs font-medium tabular-nums leading-4 ${color}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

/**
 * Right-sidebar trading panel. Wraps `InstantTrade` from the dex package so
 * the Buy / Sell form remains a single source of truth, then stacks a read-
 * only position-stats row (Bought / Sold / Holding / PnL). Color tokens
 * come from HeroUI semantic palette only — no Axiom hex leaks here.
 */
export function TradingPanel() {
  return (
    <div className="relative axiom-trade-panel">
      <div className="relative h-full w-full">
        <InstantTrade className="!rounded-none !bg-transparent !py-2 !px-3" />

        <div className="flex w-full flex-row items-center justify-between px-4 py-1">
          <PositionStat label="Bought" value="0" color="text-foreground-600" />
          <PositionStat label="Sold" value="0" color="text-foreground-600" />
          <PositionStat label="Holding" value="0" color="text-foreground-600" />
          <div className="flex flex-1 flex-col items-center justify-center gap-1">
            <span className="text-xs font-normal leading-4 text-default-500">
              PnL ⓘ
            </span>
            <span className="text-xs font-medium tabular-nums leading-4 text-bullish">
              +0 (+0%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
