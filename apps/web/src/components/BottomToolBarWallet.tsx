import { useMemo } from "react";

import { Avatar } from "@heroui/react";
import { formatAmount, getPrimaryTokenAvatar } from "@liberfi/core";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useWalletPrimaryTokenNetWorth, WalletIcon } from "@liberfi/ui-base";

export function BottomToolBarWallet() {
  const { chain } = useCurrentChain();

  const primaryTokenAvatar = useMemo(() => getPrimaryTokenAvatar(chain), [chain]);

  const balance = useWalletPrimaryTokenNetWorth();

  return (
    <div className="h-6 px-2 flex items-center gap-1 text-xs rounded-full border border-content3">
      <WalletIcon width={14} height={14} className="text-neutral" />
      {balance?.amount ? formatAmount(balance.amount) : "--"}
      <Avatar className="w-3.5 h-3.5 bg-transparent" src={primaryTokenAvatar} />
    </div>
  );
}
