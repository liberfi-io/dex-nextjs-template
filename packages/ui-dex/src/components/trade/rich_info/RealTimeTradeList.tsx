import { layoutAtom, useTranslation } from "@liberfi/ui-base";
import { useInterval } from "react-use";
import { useTradeDataContext } from "../providers";
import { BuyIcon, SellIcon } from "@/assets";
import { ChainAddress } from "../../ChainAddress";
import { formatDuration } from "@/libs";
import { useMemo, useState } from "react";
import { Number } from "@/components/Number";
import { Skeleton } from "@heroui/react";
import { Virtuoso } from "react-virtuoso";
import { useAtomValue } from "jotai";
import { TradeDetailDTO } from "@chainstream-io/sdk";

export function RealtimeTradeList() {
  const { isTradesLoading, trades } = useTradeDataContext();
  return isTradesLoading ? <Skeletons /> : <Content trades={trades} />;
}

function Content({ trades }: { trades: TradeDetailDTO[] }) {
  const layout = useAtomValue(layoutAtom);

  const { t } = useTranslation();

  const [now, setNow] = useState(Date.now());

  useInterval(() => setNow(Date.now()), 1000);

  return (
    <div className="md:flex-1 w-full flex flex-col md:overflow-hidden">
      <div className="md:flex-none w-full h-6 flex items-center justify-between text-xs">
        <div className="text-neutral">
          {t("extend.trade.transactions.type")}/{t("extend.trade.transactions.value")}
        </div>
        <div className="text-neutral">{t("extend.trade.transactions.amount")}</div>
        <div className="text-neutral">
          {t("extend.trade.transactions.age")}/{t("extend.trade.transactions.price")}
        </div>
      </div>

      <div className="md:flex-1 w-full py-2.5">
        <Virtuoso
          fixedItemHeight={48}
          className="md:h-full scrollbar-hide"
          data={trades}
          itemContent={(_, trade) => <RealTimeTradeItem trade={trade} now={now} />}
          useWindowScroll={layout === "mobile"}
        />
      </div>
    </div>
  );
}

type RealTimeTradeItemProps = {
  trade: TradeDetailDTO;
  now: number;
};

function RealTimeTradeItem({ trade, now }: RealTimeTradeItemProps) {
  const amount = useMemo(() => {
    return trade.type === "BUY" ? trade.sideTokenAmount : trade.tokenAmount;
  }, [trade]);

  const amountInUsd = useMemo(() => {
    return trade.type === "BUY" ? trade.sideTokenAmountInUsd : trade.tokenAmountInUsd;
  }, [trade]);

  const priceInUsd = useMemo(() => {
    return trade.type === "BUY" ? trade.sideTokenPriceInUsd : trade.tokenPriceInUsd;
  }, [trade]);

  return (
    <div className="w-full h-12 flex items-center justify-center gap-2 cursor-pointer">
      {trade.type === "BUY" ? (
        <BuyIcon width={38} height={38} className="text-bullish" />
      ) : (
        <SellIcon width={38} height={38} className="text-bearish" />
      )}

      <div className="flex-1 w-full flex flex-col gap-px">
        <div className="flex-1 w-full flex justify-between gap-0.5">
          <ChainAddress address={trade.accountOwnerAddress} className="text-neutral" />
          <div className="text-xxs">
            {formatDuration(Math.floor((now - trade.blockTimestamp) / 1000))}
          </div>
        </div>

        <div className="flex-1 w-full flex justify-between gap-2">
          <div
            className="flex-1 text-xs text-bullish data-[sell=true]:text-bearish"
            data-sell={trade.type === "SELL"}
          >
            {amountInUsd !== undefined ? (
              <Number value={amountInUsd} abbreviate defaultCurrencySign="$" />
            ) : (
              "-"
            )}
          </div>
          <div
            className="flex-1 text-xs text-bullish data-[sell=true]:text-bearish"
            data-sell={trade.type === "SELL"}
          >
            {amount !== undefined ? <Number value={amount} abbreviate /> : "-"}
          </div>
          <div className="flex-1 min-w-8 text-right text-xs text-foreground">
            {priceInUsd !== undefined ? <Number value={priceInUsd} defaultCurrencySign="$" /> : "-"}
          </div>
        </div>
      </div>
    </div>
  );
}

function Skeletons() {
  const { t } = useTranslation();
  return (
    <div className="md:flex-1 w-full flex flex-col md:overflow-hidden">
      {/* list headers */}
      <div className="w-full h-6 flex items-center justify-between text-xs">
        <div className="text-neutral">
          {t("extend.trade.transactions.type")}/{t("extend.trade.transactions.value")}
        </div>
        <div className="text-neutral">{t("extend.trade.transactions.amount")}</div>
        <div className="text-neutral">
          {t("extend.trade.transactions.age")}/{t("extend.trade.transactions.price")}
        </div>
      </div>

      <div className="md:flex-1 w-full py-2.5">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="w-full h-12 py-2">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
