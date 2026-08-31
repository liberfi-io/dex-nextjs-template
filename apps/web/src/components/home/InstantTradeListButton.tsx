"use client";

import { memo, useMemo } from "react";
import BigNumber from "bignumber.js";
import { Button, cn, LightningIcon, Spinner } from "@liberfi.io/ui";
import {
  type InstantTradeListButtonWidgetProps,
  useInstantTradeListButtonScript,
} from "@liberfi.io/ui-trade";

const MAX_SOL_DECIMALS = 9;
const SUBSCRIPT_DIGITS = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];

function toSubscriptNumber(value: number): string {
  return String(value)
    .split("")
    .map((digit) => SUBSCRIPT_DIGITS[Number(digit)] ?? digit)
    .join("");
}

function formatWithGrouping(value: BigNumber.Value, precision = 0): string {
  const parts = new BigNumber(value)
    .decimalPlaces(precision, BigNumber.ROUND_DOWN)
    .toString()
    .split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function formatAbbreviated(value: BigNumber.Value, precision = 0): string {
  const amount = new BigNumber(value);

  if (amount.lt(1e3)) return amount.toString();
  if (amount.lt(1e6)) return `${formatWithGrouping(amount.div(1e3), precision)}K`;
  if (amount.lt(1e9)) return `${formatWithGrouping(amount.div(1e6), precision)}M`;
  if (amount.lt(1e12)) return `${formatWithGrouping(amount.div(1e9), precision)}B`;
  return `${formatWithGrouping(amount.div(1e12), precision)}T`;
}

export function formatInstantTradeButtonAmount(value: number | undefined): string | undefined {
  if (value == null) return undefined;

  const amount = new BigNumber(value);
  if (!amount.isFinite() || amount.isNaN()) return undefined;

  const abs = amount.abs();

  if (abs.lt(0.001)) {
    const rounded = abs.decimalPlaces(MAX_SOL_DECIMALS, BigNumber.ROUND_DOWN);
    if (rounded.isZero()) return "0";

    const [, decimalPart = ""] = rounded.toFixed().split(".");
    const firstNonZeroIndex = decimalPart.search(/[1-9]/);
    if (firstNonZeroIndex < 0) return "0";

    const significantPart = decimalPart.slice(firstNonZeroIndex).replace(/0+$/, "");
    return `0.0${toSubscriptNumber(firstNonZeroIndex)}${significantPart}`;
  }

  if (abs.lt(1)) return abs.decimalPlaces(3, BigNumber.ROUND_DOWN).toString();
  if (abs.lt(100)) return abs.decimalPlaces(2, BigNumber.ROUND_DOWN).toString();
  if (abs.lt(1e3)) return abs.decimalPlaces(0, BigNumber.ROUND_DOWN).toString();

  const rounded = abs.div(100).integerValue(BigNumber.ROUND_DOWN).times(100);
  return formatAbbreviated(rounded, 0);
}

export const InstantTradeListButton = memo(function InstantTradeListButton({
  size = "sm",
  radius,
  color = "primary",
  className,
  ...scriptParams
}: InstantTradeListButtonWidgetProps) {
  const { amount, token, isDisabled, isSwapping, handleSwap } =
    useInstantTradeListButtonScript(scriptParams);

  const label = useMemo(() => {
    const formattedAmount = formatInstantTradeButtonAmount(amount);
    return formattedAmount == null ? undefined : `${formattedAmount} ${token.symbol}`;
  }, [amount, token.symbol]);

  return (
    <Button
      variant="solid"
      size={size}
      radius={radius}
      color={color}
      className={cn("min-w-0 w-auto flex-none", className)}
      disableRipple
      startContent={
        <LightningIcon className="flex-none" style={{ color: "var(--color-brand-primary)" }} />
      }
      isDisabled={isDisabled}
      isLoading={isSwapping}
      spinner={<Spinner size="sm" color="current" />}
      onPress={handleSwap}
      style={{
        background:
          "linear-gradient(hsl(var(--heroui-primary) / 0.08), hsl(var(--heroui-primary) / 0.08)), var(--color-surface-base)",
        border: "1px solid hsl(var(--heroui-primary) / 0.2)",
        color: "var(--color-brand-primary)",
        fontWeight: 600,
      }}
    >
      {label}
    </Button>
  );
});
