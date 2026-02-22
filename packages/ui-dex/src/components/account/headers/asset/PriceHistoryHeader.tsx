import { ListHeader } from "../../../ListHeader";
import { useTranslation } from "@liberfi/ui-base";

export type PriceHistoryHeaderProps = {
  className?: string;
};

export function PriceHistoryHeader({ className }: PriceHistoryHeaderProps) {
  const { t } = useTranslation();
  return (
    <ListHeader className={className} grow={false} shrink={false}>
      {t("extend.account.assets.last_24h")}
    </ListHeader>
  );
}
