import { useTranslation } from "@liberfi/ui-base";
import { ListHeader } from "@/components/ListHeader";

export type ContractHeaderProps = {
  className?: string;
};

export function ContractHeader({ className }: ContractHeaderProps) {
  const { t } = useTranslation();

  return (
    <ListHeader className={className} shrink>
      <div className="text-right">{t("extend.account.assets.contract")}</div>
    </ListHeader>
  );
}
