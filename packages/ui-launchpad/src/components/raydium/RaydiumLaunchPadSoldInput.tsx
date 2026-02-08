import { Controller, useFormContext, useWatch } from "react-hook-form";
import { NumberInput } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { useEffect, useMemo } from "react";
import { BigNumber } from "bignumber.js";
import { formatCount3 } from "@liberfi/core";
import clsx from "clsx";
import { defaultRaydiumLaunchPadFormValues } from "@/types";

export function RaydiumLaunchPadSoldInput() {
  const { control, trigger } = useFormContext();

  const { t } = useTranslation();

  const supply = useWatch({ control, name: "supply" });

  const sold = useWatch({ control, name: "sold" });

  useEffect(() => {
    trigger(["sold", "locked"]);
  }, [sold, trigger]);

  const soldAmount = useMemo(
    () => (supply && sold ? formatCount3(new BigNumber(supply).times(sold).div(100)) : undefined),
    [supply, sold],
  );

  return (
    <Controller
      control={control}
      name="sold"
      render={({
        field: { name, onChange, value, onBlur, ref, disabled },
        fieldState: { invalid, error },
      }) => (
        <div className="w-full space-y-1.5">
          <h3 className={clsx({ "text-danger": invalid })}>{t("extend.launchpad.sold_label")}</h3>
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
            placeholder={t("extend.launchpad.sold_placeholder")}
            fullWidth
            hideStepper
            endContent={"%"}
            minValue={51}
            maxValue={80}
            defaultValue={defaultRaydiumLaunchPadFormValues.sold}
            classNames={{
              inputWrapper:
                "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3 h-10",
            }}
            aria-label={t("extend.launchpad.sold_label")}
          />
          {soldAmount && <p className="p-1 text-primary text-xs">{soldAmount}</p>}
          <p className="p-1 text-neutral text-xs">{t("extend.launchpad.sold_explained")}</p>
        </div>
      )}
    />
  );
}
