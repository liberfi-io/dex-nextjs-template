import { BearishIcon, BullishIcon } from "@/assets";
import { Number } from "@/components/Number";
import { useTranslation } from "@liberfi/ui-base";
import { formatPercentage, tokenPriceChangeRatioInUsd } from "@/libs";
import { Token } from "@chainstream-io/sdk";
import { useMemo } from "react";

export function TradeHeaderTokenPrice({ token }: { token: Token }) {
  const { t } = useTranslation();

  const priceChange = useMemo(
    () =>
      tokenPriceChangeRatioInUsd(token, "24h")
        ? formatPercentage(tokenPriceChangeRatioInUsd(token, "24h")!)
        : undefined,
    [token],
  );

  const bearish = useMemo(() => priceChange && priceChange.startsWith("-"), [priceChange]);

  return (
    <div className="flex-1 h-full flex flex-col justify-center overflow-hidden">
      {/* price */}
      <div
        className="text-3xl font-medium text-bullish data-[bearish=true]:text-bearish overflow-hidden text-ellipsis whitespace-nowrap"
        data-bearish={bearish}
      >
        {token.marketData.priceInUsd ? (
          <Number value={token.marketData.priceInUsd} defaultCurrencySign="$" />
        ) : (
          "-"
        )}
      </div>

      {/* price change */}
      <div
        className="mt-1 flex items-center text-bullish gap-1 data-[bearish=true]:text-bearish text-base font-medium"
        data-bearish={bearish}
      >
        {bearish ? <BearishIcon width={12} height={12} /> : <BullishIcon width={12} height={12} />}
        {priceChange ? `${priceChange.startsWith("-") ? priceChange.slice(1) : priceChange}` : "-"}
      </div>

      {/* market cap */}
      <div className="mt-2 flex items-center gap-2 text-sm font-medium text-foreground">
        <span className="text-neutral">{t("extend.token_list.attributes.market_cap")}</span>
        <div>
          {token.marketData.marketCapInUsd ? (
            <Number value={token.marketData.marketCapInUsd} abbreviate defaultCurrencySign="$" />
          ) : (
            "-"
          )}
        </div>
      </div>
    </div>
  );
}
