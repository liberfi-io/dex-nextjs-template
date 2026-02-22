import { ListHeader } from "../../ListHeader";
import { useTranslation } from "@liberfi/ui-base";

export type ContractHeaderProps = {
  className?: string;
};

export function ContractHeader({ className }: ContractHeaderProps) {
  const { t } = useTranslation();
  return (
    <ListHeader width={105} className={className}>
      {t("extend.token_list.attributes.contract")}
    </ListHeader>
  );
}
