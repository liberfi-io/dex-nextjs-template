import { ChangeEvent, useCallback, useMemo } from "react";
import { NumberInput } from "@heroui/react";
import { getPrimaryTokenSymbol } from "@liberfi/core";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useTranslation } from "@liberfi/ui-base";

export type MaxAutoFeeInputProps = {
  value: number | null;
  onChange: (value: number | null) => void;
};

export function MaxAutoFeeInput({ value, onChange }: MaxAutoFeeInputProps) {
  const { t } = useTranslation();

  const { chain } = useCurrentChain();

  const primaryTokenSymbol = useMemo(() => getPrimaryTokenSymbol(chain), [chain]);

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
      <div className="text-xs text-neutral">{t("extend.trade.settings.max_auto_fee")}</div>
      <div>
        <NumberInput
          fullWidth
          value={value === null ? undefined : value}
          onChange={handleValueChange}
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
      </div>
    </div>
  );
}
