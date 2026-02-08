import { useTranslation } from "@liberfi/ui-base";
import {
  AgeSort,
  LiquiditySort,
  MarketCapSort,
  // PriceChangeSort,
  // PriceSort,
  useTokenListContext,
} from "../tokens";
import clsx from "clsx";

export function SearchResultTokenListHeaders() {
  const { t } = useTranslation();
  const { timeframe } = useTokenListContext();

  return (
    <div
      className={clsx(
        "h-14 px-3 flex items-center justify-between",
        "text-xxs lg:text-xs font-medium text-neutral",
        "bg-background lg:bg-content2",
        "sticky top-0 z-10",
      )}
    >
      <div className="w-auto flex-1">
        <div className="flex items-center justify-start gap-1">
          <span>{t("extend.token_list.attributes.token")}</span>/
          <AgeSort>{t("extend.token_list.attributes.age")}</AgeSort>/
          <MarketCapSort>{t("extend.token_list.attributes.market_cap")}</MarketCapSort>/
          <LiquiditySort>{t("extend.token_list.attributes.liq")}</LiquiditySort>
        </div>
      </div>
      {/* 搜索暂不支持按照价格变化排序 */}
      {/* <div className="w-[82px] lg:w-24 grow-0 shrink-0"> */}
      <div className="w-[72px] lg:w-[80px] grow-0 shrink-0">
        <div className="flex items-center justify-start gap-1">
          {/* <PriceSort>{t("extend.token_list.attributes.price")}</PriceSort>/ */}
          {t("extend.token_list.attributes.price")}/{t(`extend.token_list.attributes.price_changes.${timeframe}`)}
          {/* <PriceChangeSort>{t(`extend.token_list.attributes.price_changes.${timeframe}`)}</PriceChangeSort> */}
        </div>
      </div>
      <div className="w-8 grow-0 shrink-0"></div>
    </div>
  );
}
