import { Number } from "@/components/Number";
import { useTranslation } from "@liberfi/ui-base";
import { tokenBuyVolumesInUsd, tokenSellVolumesInUsd, tokenVolumesInUsd } from "@/libs";
import { Token } from "@chainstream-io/sdk";
import { Progress } from "@heroui/react";
import BigNumber from "bignumber.js";
import { useMemo } from "react";

type TradeTokenVolumesOverviewProps = {
  token: Token;
  timeframe: string;
};

export function TradeTokenVolumesOverview({ token, timeframe }: TradeTokenVolumesOverviewProps) {
  const { t } = useTranslation();

  const total = useMemo(() => tokenVolumesInUsd(token, timeframe) ?? 0, [token, timeframe]);
  const buys = useMemo(() => tokenBuyVolumesInUsd(token, timeframe) ?? 0, [token, timeframe]);
  const sells = useMemo(() => tokenSellVolumesInUsd(token, timeframe) ?? 0, [token, timeframe]);
  const buyPercentage = useMemo(() => {
    const totalBn = new BigNumber(total);
    const buyBn = new BigNumber(buys);
    return totalBn.eq(0) ? 0 : buyBn.div(totalBn).times(100).toNumber();
  }, [buys, total]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs">{t("extend.trade.volume.total")}</span>
        <span className="text-xs">
          <Number value={total} abbreviate />
        </span>
      </div>

      <Progress
        size="sm"
        value={buyPercentage}
        classNames={{ track: "bg-bearish", indicator: "bg-bullish" }}
      />

      <div className="flex justify-between gap-4 text-xxs">
        <span className="text-bullish">
          {t("extend.trade.volume.buys")}:{" "}
          <span>
            <Number value={buys} abbreviate defaultCurrencySign="$" />
          </span>
        </span>
        <span className="text-bearish">
          {t("extend.trade.volume.sales")}:{" "}
          <span>
            <Number value={sells} abbreviate defaultCurrencySign="$" />
          </span>
        </span>
      </div>
    </div>
  );
}
