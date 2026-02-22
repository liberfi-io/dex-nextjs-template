import { useTokenListContext } from "../TokenListContext";
import { useTranslation } from "@liberfi/ui-base";
import { PriceChangeFilter } from "../filters";
import { ListHeader } from "../../ListHeader";
import { PriceSort, PriceChangeSort } from "../sorts";

export type PriceHeaderProps = {
  className?: string;
  hideFilter?: boolean;
};

export function PriceHeader({ className, hideFilter }: PriceHeaderProps) {
  const { t } = useTranslation();

  const { timeframe } = useTokenListContext();

  return (
    <ListHeader width={130} className={className}>
      <div className="flex items-center justify-start gap-1">
        <PriceSort>{t("extend.token_list.attributes.price")}</PriceSort>/
        <PriceChangeSort>{t(`extend.token_list.attributes.price_changes.${timeframe}`)}</PriceChangeSort>
        {!hideFilter && <PriceChangeFilter />}
      </div>
    </ListHeader>
  );
}
