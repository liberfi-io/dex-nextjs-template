import { useTranslation } from "@liberfi/ui-base";
import { ListFilterForm, ListFilterFormProps } from "../../ListFilterForm";

export function HoldersFilterForm({
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
      title={t("extend.token_list.filters.holders")}
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
