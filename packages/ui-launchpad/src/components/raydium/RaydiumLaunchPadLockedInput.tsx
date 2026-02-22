import { useEffect, useMemo } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { BigNumber } from "bignumber.js";
import clsx from "clsx";
import { NumberInput } from "@heroui/react";
import { formatCount3 } from "@liberfi/core";
import { useTranslation } from "@liberfi/ui-base";
import { defaultRaydiumLaunchPadFormValues } from "../../types";

export function RaydiumLaunchPadLockedInput() {
  const { control, trigger } = useFormContext();

  const { t } = useTranslation();

  const supply = useWatch({ control, name: "supply" });

  const locked = useWatch({ control, name: "locked" });

  const lockedAmount = useMemo(() => {
    return supply && locked
      ? formatCount3(new BigNumber(supply).times(locked).div(100))
      : undefined;
  }, [supply, locked]);

  useEffect(() => {
    trigger(["locked", "sold", "vestingCliffEnabled", "vestingCliff", "vestingDuration"]);
  }, [locked, trigger]);

  return (
    <Controller
      control={control}
      name="locked"
      render={({
        field: { name, onChange, value, onBlur, ref, disabled },
        fieldState: { invalid, error },
      }) => (
        <div className="w-full space-y-1.5">
          <h3 className={clsx({ "text-danger": invalid })}>{t("extend.launchpad.locked_label")}</h3>
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
            placeholder={t("extend.launchpad.locked_placeholder")}
            fullWidth
            hideStepper
            endContent={"%"}
            minValue={0}
            maxValue={30}
            defaultValue={defaultRaydiumLaunchPadFormValues.locked}
            classNames={{
              inputWrapper:
                "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3 h-10",
            }}
            aria-label={t("extend.launchpad.locked_label")}
          />
          {lockedAmount && <p className="p-1 text-primary text-xs">{lockedAmount}</p>}
          <p className="p-1 text-neutral text-xs">{t("extend.launchpad.locked_explained")}</p>
        </div>
      )}
    />
  );
}
