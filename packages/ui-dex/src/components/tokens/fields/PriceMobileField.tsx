import { useMemo } from "react";
import clsx from "clsx";
import { BearishIcon, BullishIcon } from "../../../assets";
import { formatPercentage } from "../../../libs/format";
import { ListField } from "../../ListField";
import { PriceFieldProps } from "./PriceField";
import { useTokenListContext } from "../TokenListContext";
import { tokenPriceChangeRatioInUsd } from "../../../libs";
import { Number } from "../../Number";

export function PriceMobileField({ className, token }: PriceFieldProps) {
  const { timeframe } = useTokenListContext();

  const priceChange = useMemo(
    () =>
      tokenPriceChangeRatioInUsd(token, timeframe)
        ? formatPercentage(tokenPriceChangeRatioInUsd(token, timeframe)!)
        : undefined,
    [token, timeframe],
  );

  const bearish = useMemo(() => priceChange && priceChange.startsWith("-"), [priceChange]);

  return (
    <ListField grow={false} width={80} className={className}>
      <div className="flex flex-col items-end justify-center gap-1">
        <span className="text-xs font-medium text-foreground">
          {token.marketData.priceInUsd ? (
            <Number value={token.marketData.priceInUsd} defaultCurrencySign="$" />
          ) : (
            "-"
          )}
        </span>
        <div
          className={clsx(
            "flex shrink-0 items-center gap-0.5 text-xs font-medium",
            bearish ? "text-bearish" : "text-bullish",
          )}
        >
          {bearish ? (
            <BearishIcon width={10} height={10} />
          ) : (
            <BullishIcon width={10} height={10} />
          )}
          {priceChange
            ? `${priceChange.startsWith("-") ? priceChange.slice(1) : priceChange}`
            : "-"}
        </div>
      </div>
    </ListField>
  );
}
