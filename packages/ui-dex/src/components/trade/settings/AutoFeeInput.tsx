import { useMemo } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Button, NumberInput, Switch, Tooltip } from "@heroui/react";
import { getPrimaryTokenSymbol } from "@liberfi/core";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { InfoIcon, useTranslation } from "@liberfi/ui-base";

export function AutoFeeInput({ preset }: { preset: number }) {
  const { t } = useTranslation();

  const { control } = useFormContext();

  const enabled = useWatch({ control, name: `presets.${preset}.autoFee` });

  const { chain } = useCurrentChain();

  const primaryTokenSymbol = useMemo(() => getPrimaryTokenSymbol(chain), [chain]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-neutral flex items-center gap-1">
          {t("extend.trade.settings.auto_fee")}
          <Tooltip
            content={t("extend.trade.settings.auto_fee_explained")}
            classNames={{ content: "text-xs text-neutral py-2 px-4 max-w-xs" }}
          >
            <Button
              isIconOnly
              className="bg-transparent min-w-0 w-4 min-h-0 h-4 p-0"
              size="sm"
              disableRipple
            >
              <InfoIcon width={13} height={13} className="text-neutral" />
            </Button>
          </Tooltip>
        </h3>
        <Controller
          control={control}
          name={`presets.${preset}.autoFee`}
          render={({ field: { name, onChange, value, onBlur, ref, disabled } }) => (
            <Switch
              ref={ref}
              name={name}
              isSelected={value}
              onValueChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              color="primary"
              size="sm"
              aria-label={t("extend.trade.settings.auto_fee")}
            />
          )}
        />
      </div>
      {enabled && (
        <div className="space-y-1.5">
          <h3 className="text-xs text-neutral">{t("extend.trade.settings.max_auto_fee")}</h3>
          <Controller
            control={control}
            name={`presets.${preset}.maxAutoFee`}
            render={({
              field: { name, onChange, value, onBlur, ref, disabled },
              fieldState: { invalid },
            }) => (
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
                endContent={<span className="text-xs text-neutral">{primaryTokenSymbol}</span>}
                classNames={{
                  inputWrapper:
                    "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3 h-8 min-h-0 py-0",
                  input: "text-xs",
                }}
                aria-label={t("extend.trade.settings.max_auto_fee")}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}
