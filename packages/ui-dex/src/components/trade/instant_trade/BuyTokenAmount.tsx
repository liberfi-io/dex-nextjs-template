import { useMemo } from "react";
import { clsx } from "clsx";
import { useAtomValue } from "jotai";
import { BigNumber } from "bignumber.js";
import { formatPrice, getPrimaryTokenSymbol, SOL_TOKEN_SYMBOL } from "@liberfi/core";
import { chainAtom } from "@liberfi/ui-base";
import { tokenInfoAtom, tokenLatestPriceAtom, useQuotePrice } from "../../../states";

export type BuyTokenAmountProps = {
  className?: string;
  amount: number | undefined;
};

export function BuyTokenAmount({ amount = 1, className }: BuyTokenAmountProps) {
  const chain = useAtomValue(chainAtom);

  const primaryTokenSymbol =
    useMemo(() => getPrimaryTokenSymbol(chain), [chain]) ?? SOL_TOKEN_SYMBOL;

  // latest primary token price in usd
  const latestQuotePrice = useQuotePrice(primaryTokenSymbol);

  // latest token info
  const tokenInfo = useAtomValue(tokenInfoAtom);

  // latest token price in usd
  const latestPrice = useAtomValue(tokenLatestPriceAtom);

  const latestPriceInQuote = useMemo(
    () =>
      latestPrice && latestQuotePrice && latestPrice > 0
        ? formatPrice(new BigNumber(latestQuotePrice).div(latestPrice).times(amount))
        : "--",
    [latestQuotePrice, latestPrice, amount],
  );

  return (
    <div className={clsx("text-xs text-neutral", className)}>
      {formatPrice(amount)} {primaryTokenSymbol} ≈ {latestPriceInQuote} {tokenInfo?.symbol ?? ""}
    </div>
  );
}
