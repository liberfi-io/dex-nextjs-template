import { formatAbbreviatingNumber2, formatNumber2 } from "@/libs";
import { useMemo } from "react";

export type NumberProps = {
  value: number | string;
  defaultCurrencySign?: string;
  abbreviate?: boolean;
};

export function Number({ value, defaultCurrencySign = "", abbreviate = false }: NumberProps) {
  const { currencySign, significantDigits, zeros, decimalDigits, punctuationSymbol, suffix } =
    useMemo(
      () => (abbreviate ? formatAbbreviatingNumber2(value) : formatNumber2(value)),
      [value, abbreviate],
    );

  return (
    <>
      {currencySign ?? defaultCurrencySign}
      {significantDigits}
      {punctuationSymbol}
      {Boolean(zeros) && (
        <>
          0<sub>{zeros}</sub>
        </>
      )}
      {decimalDigits}
      {suffix}
    </>
  );
}
