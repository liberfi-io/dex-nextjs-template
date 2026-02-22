import { ArrowDownIcon, RefreshIcon } from "../../../assets";
import { Number } from "../../Number";
import { useSwapContext } from "../../swap/SwapContext";
import { TokenAvatar } from "../../TokenAvatar";
import { useAppSdk, walletNetWorthAtom, walletNetWorthQueryStateAtom } from "@liberfi/ui-base";
import { getUnwrappedAddress, getWrappedAddress, PRIMARY_TOKEN_ADDRESSES } from "../../../libs";
import { CHAIN_ID, chainSlugs } from "@liberfi/core";
import { Button, Skeleton } from "@heroui/react";
import BigNumber from "bignumber.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";

export function BuyAsset() {
  const appSdk = useAppSdk();

  const {
    chainId,
    fromTokenAddress,
    fromTokenBalance,
    fromToken,
    toTokenAddress,
    setFromTokenAddress,
  } = useSwapContext();

  // 无法使用的支付代币
  const unavailableTokenAddresses = useMemo(() => {
    if (!toTokenAddress) return [];
    // 支付代币不能和买入代币相同
    const addresses = [toTokenAddress];
    // 不能是对应的包装代币
    const wrappedAddress = getWrappedAddress(chainId, toTokenAddress);
    const unwrappedAddress = getUnwrappedAddress(chainId, toTokenAddress);
    if (wrappedAddress) {
      addresses.push(wrappedAddress);
    }
    if (unwrappedAddress) {
      addresses.push(unwrappedAddress);
    }
    return addresses;
  }, [chainId, toTokenAddress]);

  const walletNetWorth = useAtomValue(walletNetWorthAtom);

  const walletBalancesQueryState = useAtomValue(walletNetWorthQueryStateAtom);

  const isFetchingWallet = useMemo(
    () => walletBalancesQueryState?.isFetching ?? false,
    [walletBalancesQueryState],
  );

  const refetchWallet = useCallback(() => {
    walletBalancesQueryState?.refetch();
  }, [walletBalancesQueryState]);

  // 购买代币发生变化，设置默认的支付代币
  useEffect(() => {
    // 如果已经设置了可用的支付代币，则不进行设置
    if (fromTokenAddress && !unavailableTokenAddresses.includes(fromTokenAddress)) return;

    // 优先支付余额多的代币
    const balances = (walletNetWorth?.data ?? [])
      .sort((a, b) => new BigNumber(b.valueInUsd).minus(a.valueInUsd).toNumber())
      // 过滤掉无法使用的支付代币
      .filter(
        (it) =>
          unavailableTokenAddresses.length === 0 ||
          !unavailableTokenAddresses.includes(it.tokenAddress),
      );

    // 优先使用主流代币购买
    const primaryTokenAddresses = PRIMARY_TOKEN_ADDRESSES[chainSlugs[chainId as CHAIN_ID]!];
    const balance = balances.find((balance) =>
      primaryTokenAddresses?.includes(balance.tokenAddress),
    );
    if (balance) {
      setFromTokenAddress(balance.tokenAddress);
      return;
    }
    // 如果主流代币都没有余额，则使用第余额最多的代币
    if (balances.length > 0) {
      setFromTokenAddress(balances[0].tokenAddress);
      return;
    }
    // 如果是空钱包，则使用第一个可用的主流代币
    const tokenAddress = primaryTokenAddresses.find(
      (it) => unavailableTokenAddresses.length === 0 || !unavailableTokenAddresses.includes(it),
    );
    if (tokenAddress) {
      setFromTokenAddress(tokenAddress);
    }
  }, [
    chainId,
    walletNetWorth?.data,
    fromTokenAddress,
    setFromTokenAddress,
    toTokenAddress,
    unavailableTokenAddresses,
  ]);

  // 打开代币选择
  const [requestId, setRequestId] = useState<number | undefined>(undefined);

  const handleSelectAsset = useCallback(() => {
    const id = Date.now();
    appSdk.events.emit("select_asset", {
      method: "select_asset",
      id,
      params: { chainId, except_token_addresses: unavailableTokenAddresses },
    });
    setRequestId(id);
  }, [appSdk, chainId, setRequestId, unavailableTokenAddresses]);

  // 代币选择结果
  useEffect(() => {
    const handler = (options: {
      method: "response";
      id?: number | undefined;
      params: { tokenAddress: string };
    }) => {
      if (options.id === requestId) {
        setFromTokenAddress(options.params.tokenAddress);
      }
    };
    appSdk.events.on("response", handler);
    return () => {
      appSdk.events.off("response", handler);
    };
  }, [appSdk, requestId, setFromTokenAddress]);

  if (!fromToken) {
    return <Skeleton className="w-full h-8 rounded-lg" />;
  }

  return (
    <div className="w-full h-8 flex items-center justify-between">
      <div
        className="flex items-center text-neutral text-xs cursor-pointer data-[disabled=true]:cursor-not-allowed"
        data-disabled={!walletNetWorth?.data}
        onClick={handleSelectAsset}
      >
        <TokenAvatar size={24} src={fromToken?.imageUrl ?? ""} name={fromToken?.symbol} />
        {/* <WithdrawOutlinedIcon width={12} height={12} className="text-neutral ml-2" /> */}
        <div className="ml-2">
          <Number value={fromTokenBalance?.amount ?? 0} abbreviate /> {fromToken?.symbol}{" "}
          {/* <span>
            (
            <Number value={fromTokenBalance.valueInUsd} abbreviate defaultCurrencySign="$" />)
          </span> */}
        </div>
        <ArrowDownIcon className="ml-2 text-neutral" width={12} height={12} />
      </div>
      <Button
        className="flex ml-2 min-w-0 min-h-0 w-auto h-auto p-0 bg-transparent disabled:cursor-not-allowed"
        disableRipple
        isIconOnly
        onPress={refetchWallet}
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
