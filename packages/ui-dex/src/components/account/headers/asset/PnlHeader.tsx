import { useTranslation } from "@liberfi/ui-base";
import { ListHeader } from "../../../ListHeader";
import { PnlChangeSort, PnlSort } from "../../sorts/asset";

export type PnlHeaderProps = {
  className?: string;
  sort: Record<string, "asc" | "desc">;
  onSortChange: (sort: Record<string, "asc" | "desc">) => void;
};

export function PnlHeader({ className, sort, onSortChange }: PnlHeaderProps) {
  const { t } = useTranslation();

  return (
    <ListHeader className={className} shrink>
      <div className="flex items-center justify-end gap-2">
        <PnlSort sort={sort} onSortChange={onSortChange}>
          {t("extend.account.assets.pnl")}
        </PnlSort>
        <PnlChangeSort sort={sort} onSortChange={onSortChange}>
          %
        </PnlChangeSort>
      </div>
    </ListHeader>
  );
}
