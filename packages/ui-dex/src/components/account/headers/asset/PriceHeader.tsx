import { useTranslation } from "@liberfi/ui-base";
import { ListHeader } from "@/components/ListHeader";
import { PriceSort } from "../../sorts/asset";

export type PriceHeaderProps = {
  className?: string;
  sort: Record<string, "asc" | "desc">;
  onSortChange: (sort: Record<string, "asc" | "desc">) => void;
};

export function PriceHeader({ className, sort, onSortChange }: PriceHeaderProps) {
  const { t } = useTranslation();

  return (
    <ListHeader className={className} shrink>
      <PriceSort sort={sort} onSortChange={onSortChange}>
        {t("extend.account.assets.price")}
      </PriceSort>
    </ListHeader>
  );
}
