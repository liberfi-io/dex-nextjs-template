import { Number } from "@/components/Number";
import { useTranslation } from "@liberfi/ui-base";
import { tokenTrades, tokenBuys, tokenSells } from "@/libs";
import { Token } from "@chainstream-io/sdk";
import { Progress } from "@heroui/react";
import BigNumber from "bignumber.js";
import { useMemo } from "react";

type TradeTokenTransactionsOverviewProps = {
  token: Token;
  timeframe: string;
};

export function TradeTokenTransactionsOverview({
  token,
  timeframe,
}: TradeTokenTransactionsOverviewProps) {
  const { t } = useTranslation();

  const total = useMemo(() => tokenTrades(token, timeframe) ?? 0, [token, timeframe]);
  const buys = useMemo(() => tokenBuys(token, timeframe) ?? 0, [token, timeframe]);
  const sells = useMemo(() => tokenSells(token, timeframe) ?? 0, [token, timeframe]);
  const buyPercentage = useMemo(() => {
    const totalBn = new BigNumber(total);
    const buyBn = new BigNumber(buys);
    return totalBn.eq(0) ? 0 : buyBn.div(totalBn).times(100).toNumber();
  }, [buys, total]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs">{t("extend.trade.transactions.total")}</span>
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
          {t("extend.trade.transactions.buys")}:{" "}
          <span>
            <Number value={buys} abbreviate />
          </span>
        </span>
        <span className="text-bearish">
          {t("extend.trade.transactions.sales")}:{" "}
          <span>
            <Number value={sells} abbreviate />
          </span>
        </span>
      </div>
    </div>
  );
}
