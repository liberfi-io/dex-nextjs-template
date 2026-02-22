import { useTranslation } from "@liberfi/ui-base";
import { ListFilterForm, ListFilterFormProps } from "../../ListFilterForm";

export function PriceChangeFilterForm({
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
      title={t("extend.token_list.filters.price_change")}
      value={value}
      onValueChange={onValueChange}
      options={[
        { value: "5", label: "≥ 5%" },
        { value: "10", label: "≥ 10%" },
        { value: "15", label: "≥ 15%" },
        { value: "20", label: "≥ 20%" },
      ]}
      minmax
    />
  );
}
