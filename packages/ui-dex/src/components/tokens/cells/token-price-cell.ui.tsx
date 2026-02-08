import { Token } from "@chainstream-io/sdk";
import { useMemo } from "react";
import { useTokenListContext } from "../TokenListContext";
import { formatPercentage, tokenPriceChangeRatioInUsd } from "@/libs";
import { formatPriceUSD } from "@liberfi/core";
import clsx from "clsx";
import { TriangleDownIcon, TriangleUpIcon } from "@liberfi/ui-base";

export function TokenPriceCell({ token }: { token: Token }) {
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
    <div className="flex flex-col gap-1 justify-center items-start">
      <span>
        {token.marketData.priceInUsd ? formatPriceUSD(token.marketData.priceInUsd) : "--"}
      </span>
      <span
        className={clsx(
          "inline-flex gap-1 items-center",
          bearish ? "text-bearish" : "text-bullish",
        )}
      >
        {bearish ? (
          <TriangleDownIcon width={12} height={12} />
        ) : (
          <TriangleUpIcon width={12} height={12} />
        )}
        <span>
          {priceChange
            ? `${priceChange.startsWith("-") ? priceChange.slice(1) : priceChange}`
            : "-"}
        </span>
      </span>
    </div>
  );
}
