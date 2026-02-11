import { ListField } from "@/components/ListField";
import { formatPercentage } from "@/libs";
import { useMemo } from "react";
import { BearishIcon, BullishIcon } from "@/assets";
import { Token, WalletNetWorthItemDTO } from "@chainstream-io/sdk";
import BigNumber from "bignumber.js";
import { Number } from "@/components/Number";

export interface PriceFieldProps {
  className?: string;
  token?: Token;
  balance: WalletNetWorthItemDTO;
}

export function PriceField({ className, token, balance }: PriceFieldProps) {
  const price = useMemo(() => {
    const price = token?.marketData?.priceInUsd ?? balance.priceInUsd;
    // 价格为 0，说明没有价格信息
    return !price || price === "0" ? undefined : price;
  }, [token, balance]);

  const priceChangeRatioInUsd24h = useMemo(
    () => token?.stats?.periods?.["24h"]?.priceChangeRatioInUsd,
    [token],
  );

  const bullish = useMemo(
    () => new BigNumber(priceChangeRatioInUsd24h ?? 0).gte(0),
    [priceChangeRatioInUsd24h],
  );

  const priceChange = useMemo(
    () =>
      priceChangeRatioInUsd24h !== undefined
        ? formatPercentage(priceChangeRatioInUsd24h)
        : undefined,
    [priceChangeRatioInUsd24h],
  );

  return (
    <ListField className={className} shrink>
      <div className="flex flex-col justify-center">
        <div className="max-lg:text-xs text-sm text-foreground">
          {price ? <Number value={price} defaultCurrencySign="$" /> : "-"}
        </div>
        <div
          className="max-lg:text-xxs text-xs text-bearish data-[bullish=true]:text-bullish flex items-center gap-1"
          data-bullish={bullish}
        >
          {bullish ? (
            <BullishIcon width={10} height={10} />
          ) : (
            <BearishIcon width={10} height={10} />
          )}
          <span>
            {priceChange
              ? `${priceChange.startsWith("-") ? priceChange.slice(1) : priceChange}`
              : "-"}
          </span>
        </div>
      </div>
    </ListField>
  );
}
