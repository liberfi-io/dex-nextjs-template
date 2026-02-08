import { ListHeader } from "@/components/ListHeader";
import { useTranslation } from "@liberfi/ui-base";

export type TokenHeaderProps = {
  className?: string;
};

export function TokenHeader({ className }: TokenHeaderProps) {
  const { t } = useTranslation();
  return (
    <ListHeader width={160} className={className}>
      <div className="ml-2.5">{t("extend.token_list.attributes.token")}</div>
    </ListHeader>
  );
}
