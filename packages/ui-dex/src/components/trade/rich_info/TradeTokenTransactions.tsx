import { Token } from "@chainstream-io/sdk";
import { formatPercentage, tokenPriceChangeRatioInUsd } from "../../../libs";
import { Button, Divider, Skeleton } from "@heroui/react";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { TradeTokenTradersOverview } from "./TradeTokenTradersOverview";
import { TradeTokenTransactionsOverview } from "./TradeTokenTransactionsOverview";
import { TradeTokenVolumesOverview } from "./TradeTokenVolumesOverview";
import { RealtimeTradeList } from "./RealTimeTradeList";
import { useAtomValue } from "jotai";
import { tokenInfoAtom } from "../../../states";

const defaultTimeframes = ["5m", "1h", "4h", "24h"];

export function TradeTokenTransactions() {
  const token = useAtomValue(tokenInfoAtom);
  return token ? <Content token={token} /> : <Skeletons />;
}

function Content({ token }: { token: Token }) {
  const [timeframe, setTimeframe] = useState<string>(defaultTimeframes[0]);

  return (
    <div className="md:flex-1 w-full flex flex-col px-3 md:overflow-hidden">
      <div className="md:flex-none flex gap-2 pt-3 pb-5">
        {defaultTimeframes.map((tf) => (
          <TimeframeOption
            token={token}
            key={tf}
            active={tf === timeframe}
            timeframe={tf}
            onSelect={setTimeframe}
          />
        ))}
      </div>

      <div className="md:flex-none flex flex-col gap-3">
        <TradeTokenTransactionsOverview token={token} timeframe={timeframe} />
        <TradeTokenVolumesOverview token={token} timeframe={timeframe} />
        <TradeTokenTradersOverview token={token} timeframe={timeframe} />
      </div>

      <Divider className="md:flex-none border-content3 my-4" />

      <RealtimeTradeList />
    </div>
  );
}

type TimeframeOptionProps = {
  token: Token;
  active: boolean;
  timeframe: string;
  onSelect: (timeframe: string) => void;
};

function TimeframeOption({ token, active, timeframe, onSelect }: TimeframeOptionProps) {
  const priceChange = useMemo(
    () =>
      tokenPriceChangeRatioInUsd(token, timeframe)
        ? formatPercentage(tokenPriceChangeRatioInUsd(token, timeframe)!)
        : undefined,
    [token, timeframe],
  );

  const bearish = useMemo(() => priceChange && priceChange.startsWith("-"), [priceChange]);

  const handleSelect = useCallback(() => onSelect(timeframe), [onSelect, timeframe]);

  return (
    <Button
      className={clsx(
        "flex min-w-0 h-11 min-h-0 flex-1 bg-transparent cursor-pointer overflow-hidden rounded-lg border text-xs",
        "text-bullish data-[bearish=true]:text-bearish",
        "relative after:absolute after:inset-0 after:z-0 after:content-[''] after:opacity-30",
        bearish ? "after:bg-bearish" : "after:bg-bullish",
        active && bearish && "border-bearish",
        active && !bearish && "border-bullish",
        !active && "border-transparent",
      )}
      disableRipple
      data-bearish={bearish}
      data-active={active}
      onPress={handleSelect}
    >
      <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 leading-none">
        <span className="text-foreground">{timeframe}</span>
        <span>
          {priceChange ? `${priceChange.startsWith("-") ? priceChange : `+${priceChange}`}` : "-"}
        </span>
      </div>
    </Button>
  );
}

function Skeletons() {
  return (
    <div className="md:flex-1 w-full flex flex-col px-3 md:overflow-hidden">
      {/* Timeframes */}
      <div className="md:flex-none flex gap-2 pt-3 pb-5">
        {defaultTimeframes.map((tf) => (
          <Skeleton key={tf} className="h-11 flex-1 rounded-lg" />
        ))}
      </div>

      <div className="md:flex-none flex flex-col gap-3">
        <Skeleton className="w-full h-10 rounded-lg" />
        <Skeleton className="w-full h-10 rounded-lg" />
        <Skeleton className="w-full h-10 rounded-lg" />
      </div>

      <Divider className="md:flex-none border-content3 my-4" />

      <RealtimeTradeList />
    </div>
  );
}
