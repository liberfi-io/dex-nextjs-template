import { Number } from "../../Number";
import { useTranslation } from "@liberfi/ui-base";
import { tokenBuyers, tokenSellers, tokenTraders } from "../../../libs";
import { Token } from "@chainstream-io/sdk";
import { Progress } from "@heroui/react";
import BigNumber from "bignumber.js";
import { useMemo } from "react";

type TradeTokenTradersOverviewProps = {
  token: Token;
  timeframe: string;
};

export function TradeTokenTradersOverview({ token, timeframe }: TradeTokenTradersOverviewProps) {
  const { t } = useTranslation();

  const total = useMemo(() => tokenTraders(token, timeframe) ?? 0, [token, timeframe]);
  const buys = useMemo(() => tokenBuyers(token, timeframe) ?? 0, [token, timeframe]);
  const sells = useMemo(() => tokenSellers(token, timeframe) ?? 0, [token, timeframe]);
  const buyPercentage = useMemo(() => {
    const totalBn = new BigNumber(total);
    const buyBn = new BigNumber(buys);
    return totalBn.eq(0) ? 0 : buyBn.div(totalBn).times(100).toNumber();
  }, [buys, total]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs">{t("extend.trade.traders.total")}</span>
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
          {t("extend.trade.traders.buys")}:{" "}
          <span>
            <Number value={buys} abbreviate />
          </span>
        </span>
        <span className="text-bearish">
          {t("extend.trade.traders.sales")}:
          <span>
            <Number value={sells} abbreviate />
          </span>
        </span>
      </div>
    </div>
  );
}
