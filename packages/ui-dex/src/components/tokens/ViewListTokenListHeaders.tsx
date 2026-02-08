import { AgeSort, LiquiditySort, MarketCapSort, PriceChangeSort, PriceSort } from "./sorts";
import {
  AgeHeader,
  ContractHeader,
  HoldersHeader,
  MarketCapHeader,
  PriceHeader,
  SocialMediaHeader,
  TokenHeader,
  ViewListHeader,
  VolumeHeader,
} from "./headers";
import { useTokenListContext } from "./TokenListContext";
import { useTranslation } from "@liberfi/ui-base";
import clsx from "clsx";

export function ViewListTokenListHeaders() {
  const { t } = useTranslation();

  const { timeframe } = useTokenListContext();

  return (
    <div
      className={clsx(
        "w-full h-14 bg-background lg:bg-content1 lg:border-b lg:border-content3",
        "flex items-center justify-between lg:gap-1",
        // "sticky top-[calc(var(--header-height)+80px)] lg:top-[calc(var(--header-height)+72px)] z-10",
        "sticky top-[calc(var(--header-height)+80px)] z-10",
        "text-xxs font-medium text-neutral",
      )}
    >
      {/* desktop */}
      <>
        <ViewListHeader className="max-lg:hidden" />
        <TokenHeader className="max-lg:hidden" />
        <PriceHeader className="max-lg:hidden" hideFilter />
        <MarketCapHeader className="max-lg:hidden" hideFilter />
        <HoldersHeader className="max-lg:hidden" hideFilter />
        <VolumeHeader className="max-lg:hidden" hideFilter />
        <ContractHeader className="max-xl:hidden" />
        <AgeHeader className="max-xl:hidden" hideFilter />
        <SocialMediaHeader className="max-xl:hidden" />
      </>

      {/* mobile */}
      <div className="lg:hidden flex-1 flex items-center justify-start gap-1">
        <span>{t("extend.token_list.attributes.token")}</span>/
        <AgeSort>{t("extend.token_list.attributes.age")}</AgeSort>/
        <MarketCapSort>{t("extend.token_list.attributes.market_cap")}</MarketCapSort>/
        <LiquiditySort>{t("extend.token_list.attributes.liq")}</LiquiditySort>
      </div>
      <div className="lg:hidden flex-none flex items-center justify-start gap-1">
        <PriceSort>{t("extend.token_list.attributes.price")}</PriceSort>/
        <PriceChangeSort>{t(`extend.token_list.attributes.price_changes.${timeframe}`)}</PriceChangeSort>
      </div>
      <div className="lg:hidden flex-none w-8" />
    </div>
  );
}
