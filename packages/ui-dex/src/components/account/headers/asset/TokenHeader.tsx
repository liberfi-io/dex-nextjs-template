import { ListHeader } from "../../../ListHeader";
import { useTranslation } from "@liberfi/ui-base";

export type TokenHeaderProps = {
  className?: string;
};

export function TokenHeader({ className }: TokenHeaderProps) {
  const { t } = useTranslation();
  return (
    <ListHeader className={className} shrink>
      <div className="ml-2.5">{t("extend.account.assets.token")}</div>
    </ListHeader>
  );
}
