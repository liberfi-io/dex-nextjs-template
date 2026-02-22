import { WithdrawOutlinedIcon } from "../../../assets";
import { Number } from "../../Number";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { walletNetWorthAtom } from "@liberfi/ui-base";

export function OpenWalletAction({ className }: { className?: string }) {
  const walletNetWorth = useAtomValue(walletNetWorthAtom);

  return (
    <Button
      className={clsx(
        "flex w-auto min-w-0 h-full min-h-0 px-2.5 text-neutral text-xs bg-content1 rounded-lg gap-1",
        className,
      )}
      disableRipple
      startContent={<WithdrawOutlinedIcon width={14} height={14} className="text-neutral" />}
    >
      <Number value={walletNetWorth?.totalValueInUsd ?? 0} abbreviate defaultCurrencySign="$" />
    </Button>
  );
}
