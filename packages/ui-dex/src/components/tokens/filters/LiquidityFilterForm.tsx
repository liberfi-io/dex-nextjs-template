import { useTranslation } from "@liberfi/ui-base";
import { ListFilterForm, ListFilterFormProps } from "@/components/ListFilterForm";

export function LiquidityFilterForm({
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
      title={t("extend.token_list.filters.liquidity")}
      value={value}
      onValueChange={onValueChange}
      options={[
        { value: "10000", label: "≥ 10K" },
        { value: "100000", label: "≥ 100K" },
        { value: "300000", label: "≥ 300K" },
        { value: "500000", label: "≥ 500K" },
      ]}
      minmax
    />
  );
}
