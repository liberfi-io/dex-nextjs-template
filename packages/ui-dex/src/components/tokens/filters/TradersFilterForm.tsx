import { useTranslation } from "@liberfi/ui-base";
import { ListFilterForm, ListFilterFormProps } from "@/components/ListFilterForm";

export function TradersFilterForm({
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
      title={t("extend.token_list.filters.traders")}
      value={value}
      onValueChange={onValueChange}
      options={[
        { value: "100", label: "≥ 100" },
        { value: "500", label: "≥ 500" },
        { value: "1000", label: "≥ 1000" },
        { value: "2000", label: "≥ 2000" },
      ]}
      minmax
    />
  );
}
