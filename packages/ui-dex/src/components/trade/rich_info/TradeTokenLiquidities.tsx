import { ArrowDownIcon, ArrowUpIcon } from "../../../assets";
import { EmptyData } from "../../EmptyData";
import { Number } from "../../Number";
import { ChainAddress } from "../../ChainAddress";
import { useTranslation } from "@liberfi/ui-base";
import { Token } from "@chainstream-io/sdk";
import { Button, Divider, Skeleton } from "@heroui/react";
import clsx from "clsx";
import { useCallback, useState } from "react";

export function TradeTokenLiquidities({ token }: { token: Token }) {
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(token.liquidity ? token.liquidity.length <= 3 : true);
  const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), [setExpanded]);

  return (
    <section className="w-full space-y-5">
      <div className="w-full flex items-center justify-between text-xs text-neutral">
        <div className="text-sm font-medium text-foreground">{t("extend.trade.about.liquidity")}</div>
      </div>

      {token.liquidity && token.liquidity.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium leading-3 text-neutral">
              {t("extend.trade.about.available_liquidity")}
            </div>
            {token.marketData.totalTvlInUsd && (
              <div className="text-right text-xs font-medium leading-3 text-foreground">
                <Number value={token.marketData.totalTvlInUsd} abbreviate defaultCurrencySign="$" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-5">
            {token.liquidity.map((it, index) => (
              <div
                key={it.poolAddress}
                className={clsx(
                  "w-full h-10 flex items-center justify-between overflow-hidden text-xs",
                  index >= 3 && !expanded && "hidden",
                )}
              >
                <div className="flex items-center">
                  <div className="flex flex-col items-start justify-between">
                    <div className="w-full max-lg:text-sm lg:text-sm">{it.protocolFamily}</div>
                    <div className="w-full max-lg:text-xxs lg:text-xs lg:mt-0.5 flex items-center gap-1 text-neutral">
                      {`${t("extend.trade.about.liquidity_pair")}: `}
                      <ChainAddress address={it.poolAddress} />
                    </div>
                  </div>
                </div>
                <div className="shrink-1 text-neutral">
                  <Number value={it.tvlInUsd ?? 0} abbreviate defaultCurrencySign="$" />
                </div>
              </div>
            ))}
          </div>
          {token.liquidity.length > 3 && (
            <div className="flex justify-center mt-3">
              <Button
                size="sm"
                className="flex bg-transparent text-xs text-neutral rounded-sm"
                endContent={
                  expanded ? (
                    <ArrowUpIcon width={12} height={12} />
                  ) : (
                    <ArrowDownIcon width={12} height={12} />
                  )
                }
                disableRipple
                onPress={toggleExpanded}
              >
                {expanded ? t("extend.common.show_less") : t("extend.common.show_more")}
              </Button>
            </div>
          )}
        </>
      )}

      {!token.liquidity || (token.liquidity.length === 0 && <EmptyData />)}

      <Divider className="border-content3" />
    </section>
  );
}

export function TradeTokenLiquiditiesSkeleton() {
  const { t } = useTranslation();
  return (
    <section className="w-full space-y-5">
      <div className="w-full flex items-center justify-between text-xs text-neutral">
        <div className="text-sm font-medium text-foreground">{t("extend.trade.about.liquidity")}</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium leading-3 text-neutral">
          {t("extend.trade.about.available_liquidity")}
        </div>
        <div className="text-right text-xs font-medium leading-3 text-foreground">
          <Skeleton className="rounded h-3 w-10" />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <Skeleton className="rounded-lg h-10 w-full" />
        <Skeleton className="rounded-lg h-10 w-full" />
        <Skeleton className="rounded-lg h-10 w-full" />
      </div>
      <Divider className="border-content3" />
    </section>
  );
}
