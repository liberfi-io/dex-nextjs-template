import { Controller, useFormContext } from "react-hook-form";
import clsx from "clsx";
import { Select, SelectItem } from "@heroui/react";
import { formatCount3 } from "@liberfi/core";
import { useTranslation } from "@liberfi/ui-base";
import { raydiumSupplyOptions } from "@/types";

export function RaydiumLaunchPadSupplyInput() {
  const { control } = useFormContext();

  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name="supply"
      render={({
        field: { name, onChange, value, onBlur, ref, disabled },
        fieldState: { invalid, error },
      }) => (
        <div className="w-full space-y-1.5">
          <h3 className={clsx({ "text-danger": invalid })}>{t("extend.launchpad.supply_label")}</h3>
          <Select
            ref={ref}
            placeholder={t("extend.launchpad.supply_placeholder")}
            name={name}
            onChange={(e) => {
              const value = e.target.value as string;
              onChange(Number(value));
            }}
            defaultSelectedKeys={[`${value}`]}
            selectedKeys={[`${value}`]}
            onBlur={onBlur}
            disabled={disabled}
            isInvalid={invalid}
            errorMessage={error?.message ? t(error.message) : undefined}
            fullWidth
            disallowEmptySelection
            classNames={{
              trigger: [
                "h-10",
                !invalid && "bg-content2",
                !invalid && "data-[hover=true]:bg-content3",
                !invalid && "data-[focus=true]:bg-content3",
                !invalid && "data-[open=true]:bg-content3",
              ],
              selectorIcon: "text-neutral",
            }}
            popoverProps={{
              classNames: {
                content: "p-0 bg-content3 rounded-lg",
              },
            }}
            listboxProps={{
              itemClasses: {
                base: [
                  "rounded-lg text-neutral bg-content3",
                  "data-[hover=true]:bg-content3 data-[hover=true]:text-neutral",
                  "dark:data-[hover=true]:bg-content3 dark:data-[hover=true]:text-neutral",
                  "data-[selectable=true]:focus:bg-content3 data-[selectable=true]:focus:text-neutral",
                  "data-[focus-visible=true]:ring-border",
                ],
              },
            }}
            aria-label={t("extend.launchpad.supply_label")}
          >
            {raydiumSupplyOptions.map((supply) => (
              <SelectItem key={`${supply}`} textValue={formatCount3(supply)}>
                {formatCount3(supply)}
              </SelectItem>
            ))}
          </Select>
        </div>
      )}
    />
  );
}
