import { useMemo } from "react";
import { clsx } from "clsx";
import { formatAmount, getPrimaryTokenSymbol } from "@liberfi/core";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useTranslation, useWalletPrimaryTokenNetWorth } from "@liberfi/ui-base";

export type BuyTokenBalanceProps = {
  className?: string;
};

/**
 * Compact "Balance: <amount> <symbol>" line for the buy side of the trade
 * panel. The amount goes through `formatAmount` so SOL balances render as
 * `2.02` instead of the raw `2.022675194` from the portfolio query, and the
 * symbol falls back to the chain's primary token symbol when the wallet
 * portfolio response omits it (observed for native SOL on some endpoints).
 */
export function BuyTokenBalance({ className }: BuyTokenBalanceProps) {
  const { t } = useTranslation();
  const { chain } = useCurrentChain();
  const balance = useWalletPrimaryTokenNetWorth();

  // Wallet portfolio occasionally returns an empty symbol for the chain's
  // native token. Fall back to the canonical symbol per chain so the line
  // always reads e.g. "Balance: 2.02 SOL" rather than "Balance: 2.02".
  const symbol = useMemo(
    () => balance?.symbol || getPrimaryTokenSymbol(chain) || "",
    [balance?.symbol, chain],
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
