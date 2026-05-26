import { useMemo } from "react";
import { clsx } from "clsx";
import { useAtomValue } from "jotai";
import { formatAmount } from "@liberfi/core";
import { useTranslation, useWalletTokenNetWorth } from "@liberfi/ui-base";
import { tokenInfoAtom } from "../../../states";

export type SellTokenBalanceProps = {
  className?: string;
};

/**
 * Compact "Balance: <amount> <symbol>" line for the sell side of the trade
 * panel. The amount goes through `formatAmount` so values like
 * `1234.567890123` render as `1,234.56`, and the symbol falls back to the
 * token-info atom when the portfolio response is missing it.
 */
export function SellTokenBalance({ className }: SellTokenBalanceProps) {
  const { t } = useTranslation();
  const tokenInfo = useAtomValue(tokenInfoAtom);
  const balance = useWalletTokenNetWorth(tokenInfo?.address ?? "");

  const symbol = useMemo(
    () => balance?.symbol || tokenInfo?.symbol || "",
    [balance?.symbol, tokenInfo?.symbol],
  );

  const display = balance?.amount
    ? `${formatAmount(balance.amount)}${symbol ? ` ${symbol}` : ""}`
    : "--";

  return (
    <div className={clsx("text-xs text-neutral space-x-1", className)}>
      <span>{t("extend.trade.balance")}:</span>
      <span>{display}</span>
    </div>
  );
}
