import { useTranslation } from "@liberfi/ui-base";
import { ListHeader } from "@/components/ListHeader";
import { HoldersFilter } from "../filters";
import { HoldersSort } from "../sorts";

export type HoldersHeaderProps = {
  className?: string;
  hideFilter?: boolean;
};

export function HoldersHeader({ className, hideFilter }: HoldersHeaderProps) {
  const { t } = useTranslation();

  return (
    <ListHeader width={184} className={className}>
      <div className="flex items-center justify-start gap-1">
        <HoldersSort>{t("extend.token_list.attributes.holders")}</HoldersSort>/
        <span>{t("extend.token_list.attributes.holders_distribution.top_10")}</span>/
        <span>{t("extend.token_list.attributes.holders_distribution.top_100")}</span>
        {!hideFilter && <HoldersFilter />}
      </div>
    </ListHeader>
  );
}
