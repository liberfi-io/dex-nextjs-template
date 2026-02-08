import { ChangeEvent, useCallback } from "react";
import { NumberInput } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";

export type SlippageInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};

export function SlippageInput({ value, onChange }: SlippageInputProps) {
  const { t } = useTranslation();

  const handleValueChange = useCallback(
    (value: number | ChangeEvent<HTMLInputElement>) => {
      // ignore change events if the value is not a number
      if (typeof value === "number") {
        if (isNaN(value)) {
          onChange(null);
        } else {
          onChange(value);
        }
      }
    },
    [onChange],
  );

  return (
    <div className="w-full grid grid-cols-2 gap-2 items-center">
      <div className="text-xs text-neutral">{t("extend.trade.settings.slippage")}</div>
      <div>
        <NumberInput
          fullWidth
          value={value === null ? undefined : value}
          onChange={handleValueChange}
          hideStepper
          minValue={0}
          maxValue={100}
          step={1}
          endContent={<span className="text-xs text-neutral">%</span>}
          classNames={{
            inputWrapper:
              "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3 h-8 min-h-0 py-0",
            input: "text-xs",
          }}
          aria-label={t("extend.trade.settings.slippage")}
        />
      </div>
    </div>
  );
}
