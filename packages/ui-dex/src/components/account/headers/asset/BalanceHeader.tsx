import { useTranslation } from "@liberfi/ui-base";
import { ListHeader } from "../../../ListHeader";
import { BalanceSort } from "../../sorts/asset";

export type BalanceHeaderProps = {
  className?: string;
  sort: Record<string, "asc" | "desc">;
  onSortChange: (sort: Record<string, "asc" | "desc">) => void;
};

export function BalanceHeader({ className, sort, onSortChange }: BalanceHeaderProps) {
  const { t } = useTranslation();

  return (
    <ListHeader className={className} shrink>
      <div className="flex items-center justify-end lg:justify-start">
        <BalanceSort sort={sort} onSortChange={onSortChange}>
          {t("extend.account.assets.balance")}
        </BalanceSort>
      </div>
    </ListHeader>
  );
}
