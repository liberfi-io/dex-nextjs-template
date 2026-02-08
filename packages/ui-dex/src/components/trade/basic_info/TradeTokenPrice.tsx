import { useMemo } from "react";
import { useAtomValue } from "jotai";
import BigNumber from "bignumber.js";
import {
  CHAIN_QUOTE_TOKEN_SYMBOLS,
  formatLongNumber,
  formatPercentage,
  formatShortNumber,
} from "@/libs";
import {
  isPriceChartAtom,
  isUSDChartAtom,
  tokenLatestMarketCapAtom,
  tokenLatestPriceAtom,
  tokenStatsAtom,
  useQuotePrice,
} from "@/states";
import { chainAtom, useTranslation } from "@liberfi/ui-base";
import { BearishIcon, BullishIcon } from "@/assets";

export function TradeTokenPrice() {
  const { t } = useTranslation();

  const chain = useAtomValue(chainAtom);

  // chain quote token price
  const quotePrice = useQuotePrice(CHAIN_QUOTE_TOKEN_SYMBOLS[chain] ?? "");

  // latest price in usd
  const latestPrice = useAtomValue(tokenLatestPriceAtom);

  // latest market cap in usd
  const latestMarketCap = useAtomValue(tokenLatestMarketCapAtom);

  // price or market cap chart
  const isPriceChart = useAtomValue(isPriceChartAtom);

  // usd or token quote
  const isUSDChart = useAtomValue(isUSDChartAtom);

  // latest token stats
  const tokenStats = useAtomValue(tokenStatsAtom);

  const bearish = useMemo(() => {
    if (!tokenStats?.closePriceInUsd24h) return false;
    if (!latestPrice) return false;
    return new BigNumber(latestPrice).lt(tokenStats.closePriceInUsd24h);
  }, [tokenStats, latestPrice]);

  const priceChange = useMemo(() => {
    if (!tokenStats?.closePriceInUsd24h) return undefined;
    if (!latestPrice) return undefined;
    if (new BigNumber(latestPrice).eq(tokenStats.closePriceInUsd24h)) return 0;
    return new BigNumber(latestPrice)
      .minus(tokenStats.closePriceInUsd24h)
      .div(tokenStats.closePriceInUsd24h)
      .abs()
      .toNumber();
  }, [tokenStats, latestPrice]);

  const displayPrice = useMemo(() => {
    if (isPriceChart) {
      // display price
      if (!latestPrice) return undefined;

      if (isUSDChart) {
        // quote in usd
        return latestPrice;
        // quote in token
      } else {
        if (!quotePrice) return undefined;

        return new BigNumber(latestPrice).div(quotePrice).toNumber();
      }
    } else {
      // display market cap
      if (!latestMarketCap) return undefined;

      if (isUSDChart) {
        // quote in usd
        return latestMarketCap;
        // quote in token
      } else {
        if (!quotePrice) return undefined;

        return new BigNumber(latestMarketCap).div(quotePrice).toNumber();
      }
    }
  }, [quotePrice, latestPrice, latestMarketCap, isPriceChart, isUSDChart]);

  const formattedDisplayPrice = useMemo(() => {
    if (!displayPrice) return "-";

    if (isUSDChart) {
      if (isPriceChart) {
        return `$ ${formatLongNumber(displayPrice)}`;
      } else {
        return `$ ${formatShortNumber(displayPrice)}`;
      }
    } else {
      const quoteTokenSymbol = CHAIN_QUOTE_TOKEN_SYMBOLS[chain] ?? "";
      if (isPriceChart) {
        return `${formatLongNumber(displayPrice)} ${quoteTokenSymbol}`;
      } else {
        return `${formatShortNumber(displayPrice)} ${quoteTokenSymbol}`;
      }
    }
  }, [displayPrice, isUSDChart, isPriceChart, chain]);

  return (
    <div className="group flex flex-col gap-1" data-bearish={bearish}>
      <div className="font-medium leading-none text-base text-bullish group-data-[bearish=true]:text-bearish">
        {formattedDisplayPrice}
      </div>
      <div className="text-xxs leading-none flex items-center gap-2">
        <div className="text-neutral">{t("extend.common.time.24h")}</div>
        <div className="flex items-center gap-0.5 text-bullish group-data-[bearish=true]:text-bearish">
          {bearish ? <BearishIcon width={8} height={8} /> : <BullishIcon width={8} height={8} />}
          {priceChange ? `${formatPercentage(priceChange)}` : "-"}
        </div>
      </div>
    </div>
  );
}
