import { ChangeEvent, useCallback } from "react";
import { clsx } from "clsx";
import { useAtomValue } from "jotai";
import { BigNumber } from "bignumber.js";
import { NumberInput } from "@heroui/react";
import { useTranslation, useWalletTokenBalance } from "@liberfi/ui-base";
import { tokenInfoAtom } from "@/states";
import { SellPercentageQuickInputs } from "./SellPercentageQuickInputs";

export type SellAmountInputProps = {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  className?: string;
};

export function SellAmountInput({ value, onChange, className }: SellAmountInputProps) {
  const { t } = useTranslation();

  const tokenInfo = useAtomValue(tokenInfoAtom);

  const balance = useWalletTokenBalance(tokenInfo?.address ?? "");

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

  const handlePercentageQuickInputChange = useCallback(
    (value: number) => {
      if (!balance?.amount) return;
      const amount = new BigNumber(balance.amount).times(value).div(100).toNumber();
      onChange?.(amount);
    },
    [onChange, balance],
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
        endContent={<span className="flex-none text-xs text-neutral">{tokenInfo?.symbol ?? ""}</span>}
        formatOptions={{
          maximumFractionDigits: tokenInfo?.decimals ? tokenInfo.decimals : undefined,
        }}
        classNames={{
          inputWrapper: clsx(
            "h-8 min-h-0 py-0 rounded-lg rounded-b-none shadow-none",
            "bg-content2 data-[hover=true]:bg-content3 group-data-[focus=true]:bg-content3",
          ),
          input: "text-xs",
        }}
      />
      <SellPercentageQuickInputs onChange={handlePercentageQuickInputChange} />
    </div>
  );
}
