import { useTranslation } from "@liberfi/ui-base";
import { ListFilterForm, ListFilterFormProps } from "@/components/ListFilterForm";

export function MarketCapFilterForm({
  value,
  onValueChange,
  className,
}: Pick<ListFilterFormProps, "value" | "onValueChange"> & {
  className?: string;
}) {
  const { t } = useTranslation();
  return (
    <ListFilterForm
      className={className}
      title={t("extend.token_list.filters.market_cap")}
      value={value}
      onValueChange={onValueChange}
      options={[
        { value: "50000", label: "≥ 50K" },
        { value: "100000", label: "≥ 100K" },
        { value: "500000", label: "≥ 500K" },
        { value: "1000000", label: "≥ 1M" },
      ]}
      minmax
    />
  );
}
