import { ChangeEvent, useCallback, useMemo } from "react";
import clsx from "clsx";
import { NumberInput } from "@heroui/react";
import { getPrimaryTokenDecimals, getPrimaryTokenSymbol } from "@liberfi/core";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useTranslation } from "@liberfi/ui-base";
import { BuyAmountQuickInputs } from "./BuyAmountQuickInputs";

export type BuyAmountInputProps = {
  className?: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
};

export function BuyAmountInput({ value, onChange, className }: BuyAmountInputProps) {
  const { t } = useTranslation();

  const { chain } = useCurrentChain();

  const primaryTokenSymbol = useMemo(() => getPrimaryTokenSymbol(chain), [chain]);

  const primaryTokenDecimals = useMemo(() => getPrimaryTokenDecimals(chain), [chain]);

  const handleValueChange = useCallback(
    (value: number | ChangeEvent<HTMLInputElement>) => {
      // ignore change events if the value is not a number
      if (typeof value === "number") {
        const v = isNaN(value) ? undefined : value;
        onChange?.(v);
      }
    },
    [onChange],
  );

  const handleQuickInputChange = useCallback(
    (value: number) => {
      onChange?.(value);
    },
    [onChange],
  );

  return (
    <div className={clsx("space-y-0.5", className)}>
      <NumberInput
        min={0}
        value={value}
        onChange={handleValueChange}
        fullWidth
        hideStepper
        startContent={<span className="flex-none text-xs text-neutral">{t("extend.trade.amount")}</span>}
        endContent={<span className="flex-none text-xs text-neutral">{primaryTokenSymbol}</span>}
        formatOptions={{
          maximumFractionDigits: primaryTokenDecimals,
        }}
        classNames={{
          inputWrapper: clsx(
            "h-8 min-h-0 py-0 rounded-lg rounded-b-none shadow-none",
            "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3",
          ),
          input: "text-xs",
        }}
      />
      <BuyAmountQuickInputs onChange={handleQuickInputChange} />
    </div>
  );
}
