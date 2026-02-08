import { useTranslation } from "@liberfi/ui-base";
import { ListHeader } from "@/components/ListHeader";
import { MarketCapAndLiquidityCompositeFilter } from "../filters";
import { LiquiditySort, MarketCapSort } from "../sorts";

export type MarketCapHeaderProps = {
  className?: string;
  hideFilter?: boolean;
};

export function MarketCapHeader({ className, hideFilter }: MarketCapHeaderProps) {
  const { t } = useTranslation();

  return (
    <ListHeader width={146} className={className}>
      <div className="flex items-center justify-start gap-1">
        <MarketCapSort>{t("extend.token_list.attributes.market_cap")}</MarketCapSort>/
        <LiquiditySort>{t("extend.token_list.attributes.liquidity")}</LiquiditySort>
        {!hideFilter && <MarketCapAndLiquidityCompositeFilter />}
      </div>
    </ListHeader>
  );
}
