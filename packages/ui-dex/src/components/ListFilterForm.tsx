import { useTranslation } from "@liberfi/ui-base";
import { Button, Input } from "@heroui/react";
import clsx from "clsx";
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";

export type ListFilterFormProps = PropsWithChildren<{
  title: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: { value: string; label: string }[];
  minmax?: boolean;
  className?: string;
  classNames?: {
    option?: string;
    minmax?: string;
  };
}>;

export function ListFilterForm({
  title,
  value,
  onValueChange,
  options,
  minmax = false,
  className,
  classNames,
  children,
}: ListFilterFormProps) {
  const { t } = useTranslation();

  const [selected, setSelected] = useState(value && !value.includes(":") ? value : "");
  const [min, setMin] = useState(value && value.includes(":") ? value.split(":")[0] : "");
  const [max, setMax] = useState(value && value.includes(":") ? value.split(":")[1] : "");

  useEffect(() => {
    setSelected(value && !value.includes(":") ? value : "");
    setMin(value && value.includes(":") ? value.split(":")[0] : "");
    setMax(value && value.includes(":") ? value.split(":")[1] : "");
  }, [value]);

  const handleSelectedValue = useCallback(
    (value: string) => {
      setMin("");
      setMax("");
      setSelected(value);
    },
    [setMin, setMax, setSelected],
  );

  const handleMinValue = useCallback(
    (value: string) => {
      setMin(value);
      setSelected("");
    },
    [setMin, setSelected],
  );

  const handleMaxValue = useCallback(
    (value: string) => {
      setMax(value);
      setSelected("");
    },
    [setMax, setSelected],
  );

  const currentValue = useMemo(() => {
    return selected ? selected : min || max ? `${min || ""}:${max || ""}` : "";
  }, [selected, min, max]);

  useEffect(() => onValueChange?.(currentValue), [currentValue, onValueChange]);

  return (
    <div className={className}>
      <div className="mb-4 text-sm font-medium text-foreground">{title}</div>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => (
          <Button
            key={option.value}
            className={clsx(
              "flex w-auto min-w-0 h-8 min-h-0 p-0",
              // 4 options per row
              "basis-[calc(25%-7.5px)]",
              "items-center justify-center rounded-lg",
              "text-xs font-medium",
              currentValue === option.value
                ? "bg-divider text-foreground border border-transparent"
                : "bg-transparent text-neutral border border-content3",
              classNames?.option,
            )}
            onPress={() => handleSelectedValue(option.value)}
            disableRipple
          >
            {option.label}
          </Button>
        ))}
        {minmax && (
          <>
            <div className={clsx("basis-[calc(50%-5px)]", classNames?.minmax)}>
              <Input
                value={min}
                onValueChange={handleMinValue}
                fullWidth
                type="number"
                placeholder={t("extend.token_list.filters.min")}
                classNames={{
                  inputWrapper:
                    "h-8 min-h-8 rounded-lg bg-content1 data-[hover=true]:bg-content1 group-data-[focus=true]:bg-content1 group-data-[focus-visible=true]:ring-0",
                  input:
                    "text-center placeholder:text-xs placeholder:text-neutral text-foreground caret-neutral",
                }}
              />
            </div>
            <div className={clsx("basis-[calc(50%-5px)]", classNames?.minmax)}>
              <Input
                value={max}
                onValueChange={handleMaxValue}
                fullWidth
                type="number"
                placeholder={t("extend.token_list.filters.max")}
                classNames={{
                  inputWrapper:
                    "h-8 min-h-8 rounded-lg bg-content1 data-[hover=true]:bg-content1 group-data-[focus=true]:bg-content1 group-data-[focus-visible=true]:ring-0",
                  input:
                    "text-center placeholder:text-xs placeholder:text-neutral text-foreground caret-neutral",
                }}
              />
            </div>
          </>
        )}
        {children}
      </div>
    </div>
  );
}
