import { useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { Token } from "@chainstream-io/sdk";
import { tokenInfoAtom } from "@liberfi/ui-dex/states";
import { Number as NumberDisplay } from "@liberfi/ui-dex/components/Number";
import {
  tokenVolumesInUsd,
  tokenBuyVolumesInUsd,
  tokenSellVolumesInUsd,
  tokenBuys,
  tokenSells,
  tokenPriceChangeRatioInUsd,
  formatPercentage,
} from "@liberfi/ui-dex/libs";
const TIMEFRAMES = ["5m", "1h", "4h", "24h"] as const;

export function SidebarVolumeStats() {
  const token = useAtomValue(tokenInfoAtom);
  if (!token) return <StatsPlaceholder />;
  return <Content token={token} />;
}

function Content({ token }: { token: Token }) {
  const [tf, setTf] = useState<string>("5m");

  const vol = useMemo(() => tokenVolumesInUsd(token, tf), [token, tf]);
  const buyVol = useMemo(() => tokenBuyVolumesInUsd(token, tf), [token, tf]);
  const sellVol = useMemo(() => tokenSellVolumesInUsd(token, tf), [token, tf]);
  const buys = useMemo(() => tokenBuys(token, tf), [token, tf]);
  const sells = useMemo(() => tokenSells(token, tf), [token, tf]);

  const netVol = useMemo(() => {
    if (buyVol == null || sellVol == null) return undefined;
    return Number(buyVol) - Number(sellVol);
  }, [buyVol, sellVol]);

  return (
    <div className="relative flex min-h-[64px] flex-col items-center justify-start gap-0">
      {/* Timeframe pills overlay — absolute, same area as volume stats */}
      <div className="absolute left-0 top-0 h-[64px] w-full overflow-hidden z-10">
        <div className="absolute left-0 top-0 flex h-full max-h-[64px] min-h-[64px] w-full flex-row items-center justify-start bg-background/70 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity">
          {TIMEFRAMES.map((t) => {
            const change = tokenPriceChangeRatioInUsd(token, t);
            const formatted = change ? formatPercentage(change) : "-";
            const isBearish = formatted.startsWith("-");
            return (
              <button
                key={t}
                onClick={() => setTf(t)}
                className="flex-1 flex flex-col items-center justify-center h-[64px] transition-colors hover:bg-content2/50"
              >
                <span className="text-xs font-medium text-[rgb(200,201,209)]">{t}</span>
                <span className={`text-[13px] font-medium leading-[17px] ${isBearish ? "text-bearish" : "text-bullish"}`}>
                  {formatted.startsWith("-") ? formatted : `+${formatted}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Volume stats — Axiom: min-h-64 max-h-64 p-16 pb-20 gap-16 flex-col border-b */}
      <div className="flex max-h-[64px] min-h-[64px] w-full flex-col items-center justify-center gap-4 text-nowrap border-b border-neutral-800 p-4 pb-5">
        <div className="flex w-full flex-col items-center justify-center gap-2 text-nowrap">
          <div className="flex w-full flex-row items-center justify-between text-xs font-medium leading-4">
            <span className="text-[rgb(200,201,209)]">
              {tf} Vol{" "}
              <span className="text-[rgb(200,201,209)] tabular-nums">
                {vol != null ? <NumberDisplay value={vol} abbreviate defaultCurrencySign="$" /> : "$0"}
              </span>
            </span>
            <span className="text-bullish tabular-nums">
              <span className="font-normal text-[rgb(119,122,140)]">Buys </span>{buys ?? 0}/{buyVol != null ? <NumberDisplay value={buyVol} abbreviate defaultCurrencySign="$" /> : "$0"}
            </span>
          </div>
          <div className="flex w-full flex-row items-center justify-between text-xs font-medium leading-4">
            <span className="text-bearish tabular-nums">
              <span className="font-normal text-[rgb(119,122,140)]">Sells </span>{sells ?? 0}/{sellVol != null ? <NumberDisplay value={sellVol} abbreviate defaultCurrencySign="$" /> : "$0"}
            </span>
            <span className="tabular-nums">
              <span className="font-normal text-[rgb(119,122,140)]">Net Vol. </span>
              {netVol != null ? (
                <span className={netVol >= 0 ? "text-bullish" : "text-bearish"}>
                  {netVol >= 0 ? "+" : "-"}
                  <NumberDisplay value={Math.abs(netVol)} abbreviate defaultCurrencySign="$" />
                </span>
              ) : (
                <span className="text-foreground">-$0</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsPlaceholder() {
  return (
    <div className="relative flex min-h-[64px] flex-col items-center justify-start gap-0">
      <div className="flex max-h-[64px] min-h-[64px] w-full flex-col items-center justify-center gap-4 border-b border-neutral-800 p-4 pb-5">
        <div className="flex w-full flex-col gap-2">
          <div className="h-4 w-full bg-content2 rounded animate-pulse" />
          <div className="h-4 w-full bg-content2 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
