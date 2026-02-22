import { Skeleton } from "@heroui/react";
import { Chain } from "@liberfi/core/";
import { useWalletTradesQuery } from "@liberfi/react-dex";
import clsx from "clsx";
import { ListEmptyData } from "../ListEmptyData";
import { TokenAvatar } from "../TokenAvatar";
import { useAuth, useTranslation } from "@liberfi/ui-base";
import { useMemo } from "react";
import { Number } from "../Number";
import { Virtuoso } from "react-virtuoso";
import { TradeDetailDTO } from "@chainstream-io/sdk";

export type ActivityListProps = {
  chainId?: Chain;
  compact?: boolean;
  useWindowScroll?: boolean;
  classNames?: {
    itemWrapper?: string;
    item?: string;
  };
};

export function ActivityList({
  chainId = Chain.SOLANA,
  compact,
  useWindowScroll,
  classNames,
}: ActivityListProps) {
  const { user } = useAuth();

  const { data, isLoading } = useWalletTradesQuery({
    chain: chainId,
    walletAddress: user?.solanaAddress ?? "",
  });

  if (isLoading || !data) {
    return <Skeletons compact={compact} classNames={classNames} />;
  }

  if (!data.data || data.data.length === 0) {
    return <ListEmptyData />;
  }

  return (
    <Virtuoso
      className={clsx(compact && "scrollbar-hide")}
      useWindowScroll={useWindowScroll}
      fixedItemHeight={56}
      data={data.data}
      itemContent={(_, trade) => (
        <TradeItem trade={trade} classNames={classNames} compact={compact} />
      )}
    />
  );
}

type TradeItemProps = {
  trade: TradeDetailDTO;
  compact?: boolean;
  classNames?: {
    itemWrapper?: string;
    item?: string;
  };
};

function TradeItem({ trade, compact = false, classNames }: TradeItemProps) {
  const { t } = useTranslation();

  // sideType 是针对 baseToken 的，我们展示数据针对 baseToken

  const direction = useMemo(
    () => (trade.type === "BUY" ? t("extend.account.activities.buy") : t("extend.account.activities.sell")),
    [trade, t],
  );

  const bullish = useMemo(() => trade.type === "BUY", [trade]);

  return (
    <div className={clsx("group w-full h-14", classNames?.itemWrapper)} data-compact={compact}>
      <div
        className={clsx(
          "w-full h-full flex items-center justify-between gap-2",
          "rounded-lg hover:bg-content1 lg:group-data-[compact=false]:hover:bg-content3",
          classNames?.item,
        )}
      >
        <div className="flex-none">
          <TokenAvatar src={trade.tokenImageUrl} size={32} />
        </div>
        <div className="flex-1 flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-1">
            <div className="text-sm max-lg:text-xs font-medium lg:group-data-[compact=true]:text-xs">
              {direction}
            </div>
          </div>
          <div className="text-xs max-lg:text-xxs text-neutral overflow-hidden text-ellipsis whitespace-nowrap max-lg:max-w-[140px] lg:group-data-[compact=true]:max-w-[140px] lg:group-data-[compact=true]:text-xxs">
            {new Date(trade.blockTimestamp).toLocaleString()}
          </div>
        </div>
        <div className="flex-none flex flex-col justify-center gap-0.5 text-right">
          <div
            className="text-sm max-lg:text-xs text-bearish data-[bullish=true]:text-bullish lg:group-data-[compact=true]:text-xs"
            data-bullish={bullish}
          >
            {bullish ? "+" : "-"}{" "}
            <span>
              <Number value={trade.tokenAmount} abbreviate />
            </span>{" "}
            {trade.tokenSymbol}
          </div>

          <div className="text-xs max-lg:text-xxs text-neutral lg:group-data-[compact=true]:text-xxs">
            <span>
              <Number value={trade.tokenAmountInUsd} abbreviate defaultCurrencySign="$" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

type SkeletonsProps = {
  compact?: boolean;
  classNames?: {
    itemWrapper?: string;
    item?: string;
  };
};

function Skeletons({ compact, classNames }: SkeletonsProps) {
  return [...Array(6)].map((_, index) => (
    <div
      key={index}
      className={clsx("w-full h-14", classNames?.itemWrapper)}
      data-compact={compact}
    >
      <div
        className={clsx("w-full h-full flex items-center justify-between gap-2", classNames?.item)}
      >
        <Skeleton className="w-8 h-8 rounded-full flex-none" />

        <div className="flex-1 flex flex-col justify-center gap-0.5">
          <div className="w-16 h-5 max-lg:h-4 lg:group-data-[compact=true]:h-4 py-1">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
          <div className="w-20 h-4 max-lg:h-3 lg:group-data-[compact=true]:h-3 py-0.5">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        </div>

        <div className="flex-none flex flex-col justify-center items-end gap-0.5">
          <div className="w-20 h-5 max-lg:h-4 lg:group-data-[compact=true]:h-4 py-1">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>

          <div className="w-24 h-4 max-lg:h-3 lg:group-data-[compact=true]:h-3 py-0.5">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  ));
}
