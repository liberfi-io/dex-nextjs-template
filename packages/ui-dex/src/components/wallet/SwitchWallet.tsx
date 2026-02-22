import { useCallback, useMemo } from "react";
import { clsx } from "clsx";
import { Avatar, Button } from "@heroui/react";
import { formatAmount, getPrimaryTokenAvatar } from "@liberfi/core";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  SettingsIcon,
  useAppSdk,
  useWalletPrimaryTokenNetWorth,
  WalletIcon,
} from "@liberfi/ui-base";

export type SwitchWalletProps = {
  enableSettings?: boolean;
};

export function SwitchWallet({ enableSettings = false }: SwitchWalletProps) {
  const appSdk = useAppSdk();

  const { chain } = useCurrentChain();

  const primaryTokenAvatar = useMemo(() => getPrimaryTokenAvatar(chain), [chain]);

  const balance = useWalletPrimaryTokenNetWorth();

  const handleSettings = useCallback(() => appSdk.events.emit("trade_settings:open"), [appSdk]);

  return (
    <div className="flex items-center gap-2">
      <div className="h-8 px-3 bg-content2 flex items-center gap-2 text-sm rounded-full">
        <WalletIcon width={16} height={16} className="text-neutral" />
        {balance?.amount ? formatAmount(balance.amount) : "--"}
        <Avatar className="w-4 h-4 bg-transparent" src={primaryTokenAvatar} />
      </div>

      <Button
        isIconOnly
        className={clsx("w-6 h-6 min-w-6 min-h-6 bg-transparent p-0", { hidden: !enableSettings })}
        size="sm"
        disableRipple
        onPress={handleSettings}
      >
        <SettingsIcon width={18} height={18} className="text-neutral" />
      </Button>
    </div>
  );
}
