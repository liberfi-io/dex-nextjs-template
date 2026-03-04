import { RefreshIcon } from "../../../assets";
import { Number } from "../../Number";
import { useSwapContext } from "../../swap/SwapContext";
import { TokenAvatar } from "../../TokenAvatar";
import { Button, Skeleton } from "@heroui/react";
import { useWalletPortfolios } from "@liberfi/ui-base";
import { useCallback, useMemo } from "react";

export function SellAsset() {
  const { fromToken, fromTokenBalance } = useSwapContext();

  const { isFetching: isFetchingWallet, refetch: refetchWallet } = useWalletPortfolios();

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
            <Number value={fromTokenBalance.amountInUsd} abbreviate defaultCurrencySign="$" />)
          </span> */}
        </div>
      </div>
      <Button
        className="flex ml-2 min-w-0 min-h-0 w-auto h-auto p-0 bg-transparent disabled:cursor-not-allowed"
        disableRipple
        isIconOnly
        onPress={() => refetchWallet()}
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
