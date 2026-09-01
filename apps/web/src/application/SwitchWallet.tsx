"use client";

import { useCallback, useMemo } from "react";
import { Avatar, Button } from "@heroui/react";
import { cn, SettingsIcon, WalletIcon } from "@liberfi.io/ui";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  formatWalletPrimaryTokenBalance,
  useWalletPrimaryTokenNetWorth,
} from "./useWalletPrimaryTokenNetWorth";
import { getPrimaryTokenAvatar } from "./tokens";
import { useOpenPresetForm } from "./useOpenPresetForm";

export type SwitchWalletProps = {
  enableSettings?: boolean;
};

export function SwitchWallet({ enableSettings = false }: SwitchWalletProps) {
  const { chain } = useCurrentChain();
  const primaryTokenAvatar = useMemo(() => getPrimaryTokenAvatar(chain), [chain]);
  const balance = useWalletPrimaryTokenNetWorth();
  const openPresetForm = useOpenPresetForm();
  const handleSettings = useCallback(() => openPresetForm(0), [openPresetForm]);

  return (
    <div className="flex items-center gap-2">
      <div className="h-8 px-3 bg-content2 flex items-center gap-2 text-sm rounded-full">
        <WalletIcon width={16} height={16} className="text-text-muted" />
        {formatWalletPrimaryTokenBalance(balance?.amount)}
        <Avatar className="w-4 h-4 bg-transparent" src={primaryTokenAvatar} />
      </div>
      <Button
        isIconOnly
        className={cn("w-6 h-6 min-w-6 min-h-6 bg-transparent p-0", { hidden: !enableSettings })}
        size="sm"
        disableRipple
        onPress={handleSettings}
      >
        <SettingsIcon width={18} height={18} className="text-text-muted" />
      </Button>
    </div>
  );
}
