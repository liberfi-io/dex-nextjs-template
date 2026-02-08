import { Controller, useFormContext } from "react-hook-form";
import clsx from "clsx";
import { NumberInput, Select, SelectItem } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { defaultRaydiumLaunchPadFormValues } from "@/types";

export function RaydiumLaunchPadVestingDurationInput() {
  const { t } = useTranslation();

  const { control, formState } = useFormContext();

  return (
    <div className="w-full space-y-1.5">
      <h3 className={clsx({ "text-danger": !!formState.errors["vestingDuration"] })}>
        {t("extend.launchpad.vesting_duration_label")}
      </h3>
      <div className="flex items-center gap-2">
        <div className="flex-0 basis-1/2 overflow-hidden">
          <Controller
            control={control}
            name="vestingDuration"
            render={({
              field: { name, onChange, value, onBlur, ref, disabled },
              fieldState: { invalid },
            }) => (
              <NumberInput
                ref={ref}
                name={name}
                value={value}
                onChange={(value) => {
                  // ignore change events if the value is not a number
                  if (typeof value === "number") {
                    onChange(value);
                  }
                }}
                onBlur={onBlur}
                fullWidth
                hideStepper
                isInvalid={invalid}
                minValue={1}
                disabled={disabled}
                defaultValue={defaultRaydiumLaunchPadFormValues.vestingDuration}
                step={1}
                classNames={{
                  inputWrapper:
                    "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3 h-10",
                }}
                aria-label={t("extend.launchpad.vesting_duration_label")}
              />
            )}
          />
        </div>
        <div className="flex-0 basis-1/2 overflow-hidden">
          <Controller
            control={control}
            name="vestingDurationUnit"
            render={({
              field: { name, onChange, value, onBlur, ref, disabled },
              fieldState: { invalid },
            }) => (
              <Select
                ref={ref}
                name={name}
                defaultSelectedKeys={[value]}
                selectedKeys={[value]}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                fullWidth
                disallowEmptySelection
                isInvalid={invalid}
                classNames={{
                  trigger: [
                    "h-10 bg-content2",
                    !invalid && "data-[hover=true]:bg-content3",
                    !invalid && "data-[focus=true]:bg-content3",
                    !invalid && "data-[open=true]:bg-content3",
                  ],
                  selectorIcon: "text-neutral",
                }}
                popoverProps={{
                  classNames: {
                    content: "p-0 bg-content2 rounded-lg",
                  },
                }}
                listboxProps={{
                  itemClasses: {
                    base: [
                      "rounded-lg text-neutral bg-content2",
                      "data-[hover=true]:bg-content2 data-[hover=true]:text-neutral",
                      "dark:data-[hover=true]:bg-content2 dark:data-[hover=true]:text-neutral",
                      "data-[selectable=true]:focus:bg-content2 data-[selectable=true]:focus:text-neutral",
                      "data-[focus-visible=true]:ring-border",
                    ],
                  },
                }}
                aria-label={t("extend.launchpad.vesting_duration_label")}
              >
                {["y", "m", "w", "d"].map((option) => (
                  <SelectItem key={option} textValue={t(`extend.launchpad.vesting_duration_${option}`)}>
                    {t(`extend.launchpad.vesting_duration_${option}`)}
                  </SelectItem>
                ))}
              </Select>
            )}
          />
        </div>
      </div>
      {formState.errors["vestingDuration"]?.message && (
        <p className="p-1 text-xs text-danger">
          {t(formState.errors["vestingDuration"].message as string)}
        </p>
      )}
      <p className="p-1 text-neutral text-xs">{t("extend.launchpad.vesting_duration_explained")}</p>
    </div>
  );
}
