import { tokenInfoAtom } from "@/states";
import { useTranslation, useWalletTokenNetWorth } from "@liberfi/ui-base";
import { clsx } from "clsx";
import { useAtomValue } from "jotai";

export type SellTokenBalanceProps = {
  className?: string;
};

export function SellTokenBalance({ className }: SellTokenBalanceProps) {
  const { t } = useTranslation();

  const tokenInfo = useAtomValue(tokenInfoAtom);

  const balance = useWalletTokenNetWorth(tokenInfo?.address ?? "");

  return (
    <div className={clsx("text-xs text-neutral space-x-1", className)}>
      <span>{t("extend.trade.balance")}:</span>
      <span>{balance?.amount ? `${balance.amount} ${balance.symbol}` : "--"}</span>
    </div>
  );
}
