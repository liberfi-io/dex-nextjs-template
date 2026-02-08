import { Controller, useFormContext, useWatch } from "react-hook-form";
import clsx from "clsx";
import { NumberInput, Select, SelectItem, Switch } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { defaultRaydiumLaunchPadFormValues } from "@/types";
import { useEffect } from "react";

export function RaydiumLaunchPadVestingCliffInput() {
  const { t } = useTranslation();

  const { control, formState, trigger } = useFormContext();

  const enabled = useWatch({ control, name: "vestingCliffEnabled" });

  useEffect(() => {
    trigger(["vestingCliff", "vestingCliffUnit", "vestingCliffEnabled"]);
  }, [enabled, trigger]);

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <h3 className={clsx({ "text-danger": !!formState.errors["vestingCliff"] })}>
          {t("extend.launchpad.vesting_cliff_label")}
        </h3>
        <Controller
          control={control}
          name="vestingCliffEnabled"
          render={({ field: { name, onChange, value, onBlur, ref, disabled } }) => (
            <Switch
              ref={ref}
              name={name}
              isSelected={value}
              onValueChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              size="sm"
              color="primary"
              aria-label={t("extend.launchpad.vesting_cliff_label")}
            />
          )}
        />
      </div>

      {enabled && (
        <div className="flex items-center gap-2">
          <div className="flex-0 basis-1/2 overflow-hidden">
            <Controller
              control={control}
              name="vestingCliff"
              render={({
                field: { name, onChange, value, onBlur, ref, disabled },
                fieldState: { invalid },
              }) => (
                <NumberInput
                  ref={ref}
                  name={name}
                  value={value}
                  onValueChange={onChange}
                  onBlur={onBlur}
                  disabled={disabled}
                  fullWidth
                  isInvalid={invalid}
                  hideStepper
                  minValue={1}
                  defaultValue={defaultRaydiumLaunchPadFormValues.vestingCliff}
                  step={1}
                  classNames={{
                    inputWrapper:
                      "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3 h-10",
                  }}
                  aria-label={t("extend.launchpad.vesting_cliff_label")}
                />
              )}
            />
          </div>
          <div className="flex-0 basis-1/2 overflow-hidden">
            <Controller
              control={control}
              name="vestingCliffUnit"
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
                  aria-label={t("extend.launchpad.vesting_cliff_label")}
                >
                  {["y", "m", "w", "d"].map((option) => (
                    <SelectItem key={option} textValue={t(`extend.launchpad.vesting_cliff_${option}`)}>
                      {t(`extend.launchpad.vesting_cliff_${option}`)}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </div>
        </div>
      )}
      {formState.errors["vestingCliff"]?.message && (
        <p className="p-1 text-xs text-danger">
          {t(formState.errors["vestingCliff"].message as string)}
        </p>
      )}
      <p className="p-1 text-neutral text-xs">{t("extend.launchpad.vesting_cliff_explained")}</p>
    </div>
  );
}
