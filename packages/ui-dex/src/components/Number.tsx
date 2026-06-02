import {
  formatAmount,
  formatAmountInUsd,
  formatPrice,
  formatPriceInUsd,
} from "@liberfi.io/utils";
import { useMemo } from "react";

export type NumberProps = {
  value: number | string;
  defaultCurrencySign?: string;
  abbreviate?: boolean;
};

export function Number({ value, defaultCurrencySign = "", abbreviate = false }: NumberProps) {
  const text = useMemo(() => {
    if (defaultCurrencySign === "$") {
      return abbreviate ? formatAmountInUsd(value) : formatPriceInUsd(value);
    }
    return abbreviate ? formatAmount(value) : formatPrice(value);
  }, [value, defaultCurrencySign, abbreviate]);

  return <>{text}</>;
}
