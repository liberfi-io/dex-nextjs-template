import { clsx } from "clsx";
import { useTranslation, useWalletPrimaryTokenNetWorth } from "@liberfi/ui-base";

export type BuyTokenBalanceProps = {
  className?: string;
};

export function BuyTokenBalance({ className }: BuyTokenBalanceProps) {
  const { t } = useTranslation();

  const balance = useWalletPrimaryTokenNetWorth();

  return (
    <div className={clsx("text-xs text-neutral space-x-1", className)}>
      <span>{t("extend.trade.balance")}:</span>
      <span>{balance?.amount ? `${balance.amount} ${balance.symbol}` : "--"}</span>
    </div>
  );
}
