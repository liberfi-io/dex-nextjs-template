import { useTranslation } from "@liberfi/ui-base";
import { ListFilterForm, ListFilterFormProps } from "@/components/ListFilterForm";

export function AgeFilterForm({
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
      title={t("extend.token_list.filters.age")}
      value={value}
      onValueChange={onValueChange}
      options={[
        { value: "10m", label: "< 10m" },
        { value: "30m", label: "< 30m" },
        { value: "1h", label: "< 1h" },
        { value: "3h", label: "< 3h" },
        { value: "6h", label: "< 6h" },
        { value: "12h", label: "< 12h" },
      ]}
      // 3 options per row
      classNames={{ option: "basis-[calc(33.33%-6.67px)]" }}
    />
  );
}
