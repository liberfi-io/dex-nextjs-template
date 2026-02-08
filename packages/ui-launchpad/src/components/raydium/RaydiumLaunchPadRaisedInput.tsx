import { Controller, useFormContext } from "react-hook-form";
import clsx from "clsx";
import { NumberInput } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { defaultRaydiumLaunchPadFormValues } from "@/types";

export function RaydiumLaunchPadRaisedInput() {
  const { control } = useFormContext();

  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name="raised"
      render={({
        field: { name, onChange, value, onBlur, ref, disabled },
        fieldState: { invalid, error },
      }) => (
        <div className="w-full space-y-1.5">
          <h3 className={clsx({ "text-danger": invalid })}>{t("extend.launchpad.raised_label")}</h3>
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
            disabled={disabled}
            isInvalid={invalid}
            errorMessage={error?.message ? t(error.message) : undefined}
            placeholder={t("extend.launchpad.raised_placeholder")}
            fullWidth
            hideStepper
            minValue={30}
            defaultValue={defaultRaydiumLaunchPadFormValues.raised}
            classNames={{
              inputWrapper:
                "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3 h-10",
            }}
            aria-label={t("extend.launchpad.raised_label")}
          />
          <p className="p-1 text-neutral text-xs">{t("extend.launchpad.raised_explained")}</p>
        </div>
      )}
    />
  );
}
