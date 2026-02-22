import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { clsx } from "clsx";
import { Button, NumberInput, Tooltip } from "@heroui/react";
import { getPrimaryTokenDecimals, getPrimaryTokenSymbol } from "@liberfi/core";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { CoinsIcon, InfoIcon, useTranslation } from "@liberfi/ui-base";

export function TipFeeInput({ preset }: { preset: number }) {
  const { t } = useTranslation();

  const { control } = useFormContext();

  const { chain } = useCurrentChain();

  const primaryTokenSymbol = useMemo(() => getPrimaryTokenSymbol(chain), [chain]);

  const primaryTokenDecimals = useMemo(() => getPrimaryTokenDecimals(chain), [chain]);

  return (
    <Controller
      control={control}
      name={`presets.${preset}.tipFee`}
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
            <CoinsIcon width={16} height={16} className="text-neutral" />
            {t("extend.trade.settings.tip_fee")}
            <Tooltip
              content={t("extend.trade.settings.tip_fee_explained")}
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
            formatOptions={{
              maximumFractionDigits: primaryTokenDecimals,
            }}
            minValue={0}
            endContent={<span className="text-xs text-neutral">{primaryTokenSymbol}</span>}
            classNames={{
              inputWrapper:
                "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3 h-8 min-h-0 py-0",
              input: "text-xs sm:text-center",
            }}
            aria-label={t("extend.trade.settings.tip_fee")}
          />
        </div>
      )}
    />
  );
}
