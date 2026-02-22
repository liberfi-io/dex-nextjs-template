import { useMemo } from "react";
import clsx from "clsx";
import { BearishIcon, BullishIcon } from "../../../assets";
import { formatPercentage } from "../../../libs/format";
import { ListField } from "../../ListField";
import { Token } from "@chainstream-io/sdk";
import { useTokenListContext } from "../TokenListContext";
import { tokenPriceChangeRatioInUsd } from "../../../libs";
import { Number } from "../../Number";

export interface PriceFieldProps {
  className?: string;
  token: Token;
}

export function PriceField({ className, token }: PriceFieldProps) {
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
    <ListField width={130} className={className}>
      <div
        className={clsx(
          "flex items-center gap-1 text-foreground",
          "max-w-full overflow-hidden text-ellipsis whitespace-nowrap",
        )}
      >
        <div>
          {token.marketData.priceInUsd ? (
            <Number value={token.marketData.priceInUsd} defaultCurrencySign="$" />
          ) : (
            "-"
          )}
        </div>
        /
        <div
          className={clsx(
            "shrink-0 flex items-center gap-0.5",
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
