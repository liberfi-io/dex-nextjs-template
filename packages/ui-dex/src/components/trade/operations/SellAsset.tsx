import { RefreshIcon } from "@/assets";
import { Number } from "@/components/Number";
import { useSwapContext } from "@/components/swap/SwapContext";
import { TokenAvatar } from "@/components/TokenAvatar";
import { Button, Skeleton } from "@heroui/react";
import { walletBalancesQueryStateAtom } from "@liberfi/ui-base";
import { useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";

export function SellAsset() {
  const { fromToken, fromTokenBalance } = useSwapContext();

  const walletBalancesQueryState = useAtomValue(walletBalancesQueryStateAtom);

  const isFetchingWallet = useMemo(
    () => walletBalancesQueryState?.isFetching ?? false,
    [walletBalancesQueryState],
  );

  const refetchWallet = useCallback(() => {
    walletBalancesQueryState?.refetch();
  }, [walletBalancesQueryState]);

  if (!fromToken) {
    return <Skeleton className="w-full h-8 rounded-lg" />;
  }

  return (
    <div className="w-full h-8 flex items-center justify-between">
      <div className="flex items-center text-neutral text-xs">
        <TokenAvatar size={24} src={fromToken.imageUrl ?? ""} name={fromToken.symbol} />
        {/* <WithdrawOutlinedIcon width={12} height={12} className="text-neutral ml-2" /> */}
        <div className="ml-2">
          <Number value={fromTokenBalance?.amount ?? 0} abbreviate /> {fromToken.symbol}{" "}
          {/* <span>
            (
            <Number value={fromTokenBalance.valueInUsd} abbreviate defaultCurrencySign="$" />)
          </span> */}
        </div>
      </div>
      <Button
        className="flex ml-2 min-w-0 min-h-0 w-auto h-auto p-0 bg-transparent disabled:cursor-not-allowed"
        disableRipple
        isIconOnly
        onPress={refetchWallet}
        disabled={!fromTokenBalance}
      >
        <RefreshIcon
          width={24}
          height={24}
          className="text-neutral data-[loading=true]:animate-spin"
          data-loading={isFetchingWallet}
        />
      </Button>
    </div>
  );
}
