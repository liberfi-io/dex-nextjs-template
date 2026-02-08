import { Divider, Skeleton } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { formatPercentage } from "@/libs";
import { ReactNode } from "react";
import { HoldersList } from "./HoldersList";
import { Number } from "@/components/Number";
import { Token } from "@chainstream-io/sdk";
import { useAtomValue } from "jotai";
import { tokenInfoAtom } from "@/states";

export function TradeTokenHolders() {
  const token = useAtomValue(tokenInfoAtom);
  return token ? <Content token={token} /> : <Skeletons />;
}

function Content({ token }: { token: Token }) {
  const { t } = useTranslation();

  return (
    <div className="md:flex-1 w-full flex flex-col px-3 pt-3 md:overflow-hidden">
      <div className="md:flex-none flex justify-between gap-2.5 text-xs">
        <Distribution
          title={t("extend.trade.holders.total")}
          distribution={
            token?.marketData?.holders ? (
              <Number value={token.marketData.holders} abbreviate />
            ) : (
              "-"
            )
          }
          volume={
            token?.marketData?.marketCapInUsd ? (
              <Number value={token.marketData.marketCapInUsd} abbreviate defaultCurrencySign="$" />
            ) : (
              "-"
            )
          }
        />
        <Distribution
          title={t("extend.trade.holders.top_10")}
          distribution={
            token?.marketData?.top10HoldingsRatio
              ? formatPercentage(token.marketData.top10HoldingsRatio)
              : "-"
          }
          volume={
            token?.marketData?.top10TotalHoldings ? (
              <Number
                value={token.marketData.top10TotalHoldings}
                abbreviate
                defaultCurrencySign="$"
              />
            ) : (
              "-"
            )
          }
        />
        <Distribution
          title={t("extend.trade.holders.top_100")}
          distribution={
            token?.marketData?.top100HoldingsRatio
              ? formatPercentage(token.marketData.top100HoldingsRatio)
              : "-"
          }
          volume={
            token?.marketData?.top100TotalHoldings ? (
              <Number
                value={token.marketData.top100TotalHoldings}
                abbreviate
                defaultCurrencySign="$"
              />
            ) : (
              "-"
            )
          }
        />
      </div>

      <Divider className="md:flex-none border-content3 my-4" />

      <div className="md:flex-1 w-full flex flex-col md:overflow-hidden">
        <div className="md:flex-none w-full h-6 flex items-center justify-between text-xs text-neutral">
          <div>{t("extend.trade.holders.address")}</div>
          <div>
            {t("extend.trade.holders.rate")}({t("extend.trade.holders.amount")})
          </div>
        </div>
        <HoldersList />
      </div>
    </div>
  );
}

type DistributionProps = {
  title: string;
  distribution: ReactNode;
  volume: ReactNode;
};

function Distribution({ title, distribution, volume }: DistributionProps) {
  return (
    <div className="flex-1 h-16 flex flex-col items-center justify-center gap-1 rounded-lg bg-content3 text-center">
      <div className="text-xxs text-neutral">{title}</div>
      <div>{distribution}</div>
      <div className="text-neutral">{volume}</div>
    </div>
  );
}

function Skeletons() {
  const { t } = useTranslation();

  return (
    <div className="md:flex-1 w-full flex flex-col px-3 pt-3 md:overflow-hidden">
      <div className="md:flex-none flex justify-between gap-2.5 text-xs">
        <Skeleton className="flex-1 h-16 rounded-lg" />
        <Skeleton className="flex-1 h-16 rounded-lg" />
        <Skeleton className="flex-1 h-16 rounded-lg" />
      </div>

      <Divider className="md:flex-none border-content3 my-4" />

      <div className="md:flex-1 w-full flex flex-col md:overflow-hidden">
        <div className="md:flex-none w-full h-6 flex items-center justify-between text-xs text-neutral">
          <div>{t("extend.trade.holders.address")}</div>
          <div>
            {t("extend.trade.holders.rate")}({t("extend.trade.holders.amount")})
          </div>
        </div>
        <HoldersList />
      </div>
    </div>
  );
}
