import { useTranslation } from "@liberfi/ui-base";
import { ListHeader } from "@/components/ListHeader";
import { VolumeSort, TxsSort, TradersSort } from "../sorts";
import { VolumeAndTxsAndTradersCompositeFilter } from "../filters";
import { useTokenListContext } from "../TokenListContext";

export type VolumeHeaderProps = {
  className?: string;
  hideFilter?: boolean;
};

export function VolumeHeader({ className, hideFilter }: VolumeHeaderProps) {
  const { t } = useTranslation();

  const { timeframe } = useTokenListContext();

  return (
    <ListHeader width={190} className={className}>
      <div className="flex items-center justify-start gap-1">
        <VolumeSort>{`${timeframe} ${t("extend.token_list.attributes.volume")}`}</VolumeSort>/
        <TxsSort>{t("extend.token_list.attributes.txs")}</TxsSort>/
        <TradersSort>{t("extend.token_list.attributes.traders")}</TradersSort>
        {!hideFilter && <VolumeAndTxsAndTradersCompositeFilter />}
      </div>
    </ListHeader>
  );
}
