import { Controller, useFormContext } from "react-hook-form";
import { clsx } from "clsx";
import { NumberInput } from "@heroui/react";
import { SlippageIcon, useTranslation } from "@liberfi/ui-base";

export function SlippageInput({ preset }: { preset: number }) {
  const { t } = useTranslation();

  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={`presets.${preset}.slippage`}
      render={({
        field: { name, onChange, value, onBlur, ref, disabled },
        fieldState: { invalid },
      }) => (
        <div className="space-y-1.5">
          <h3
            className={clsx("text-xs text-neutral flex items-center gap-1", {
              "text-danger": invalid,
            })}
          >
            <SlippageIcon width={16} height={16} className="text-neutral" />
            {t("extend.trade.settings.slippage")}
          </h3>
          <NumberInput
            ref={ref}
            fullWidth
            name={name}
            value={value}
            onChange={(value) => {
              // ignore change events if the value is not a number
              if (typeof value === "number") {
                if (isNaN(value)) {
                  onChange(null);
                } else {
                  onChange(value);
                }
              }
            }}
            onBlur={onBlur}
            disabled={disabled}
            isInvalid={invalid}
            hideStepper
            minValue={0}
            maxValue={100}
            step={1}
            endContent={<span className="text-xs text-neutral">%</span>}
            classNames={{
              inputWrapper:
                "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3 h-8 min-h-0 py-0",
              input: "text-xs sm:text-center",
            }}
            aria-label={t("extend.trade.settings.slippage")}
          />
        </div>
      )}
    />
  );
}
