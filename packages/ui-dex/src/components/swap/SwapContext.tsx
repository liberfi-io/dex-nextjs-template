import { getTxExplorerUrl, getWrappedAddress, SOL_TOKEN_DECIMALS } from "@/libs";
import BigNumber from "bignumber.js";
import {
  SendTxInputSubmitType,
  SwapRouteInputDex,
  SwapRouteInputSwapMode,
  SwapRouteResponse,
  Token,
  WalletBalanceDetailDTO,
} from "@chainstream-io/sdk";
import { CHAIN_ID, chainIcon } from "@liberfi/core";
import {
  fetchSwapRoute,
  useDexClient,
  useSendTransactionMutation,
  useTokenQuery,
} from "@liberfi/react-dex";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useAppSdk,
  useAuth,
  useTimerToast,
  useTranslation,
  useWaitForTransactionConfirmation,
  useWallet,
  walletBalancesAtom,
} from "@liberfi/ui-base";
import { Button, Image, Link } from "@heroui/react";
import { useAtomValue } from "jotai";

export type SwapContextValue = {
  // 链 ID
  chainId: CHAIN_ID;
  // 支付代币地址
  fromTokenAddress?: string | null;
  // 支付代币余额
  fromTokenBalance?: WalletBalanceDetailDTO | null;
  // 支付代币信息
  fromToken?: Token | null;
  // 设置支付代币地址
  setFromTokenAddress: (tokenAddress: string) => void;
  // 获得代币地址
  toTokenAddress?: string | null;
  // 获得代币当前余额
  toTokenBalance?: WalletBalanceDetailDTO | null;
  // 获得代币信息
  toToken?: Token | null;
  // 设置获得代币地址
  setToTokenAddress: (tokenAddress: string) => void;
  // 支付代币数量
  amount?: string;
  // 支付代币金额
  amountInUsd?: string;
  // 设置支付代币数量
  setAmount: (amount: string | undefined) => void;
  // 正在计算兑换路由
  isRouting: boolean;
  // 计算兑换路由错误
  routeError?: string | null;
  // 兑换路由
  routeInfo?: SwapRouteResponse | null;
  // 执行兑换
  swap: () => Promise<void>;
  // 是否正在执行兑换
  isSwapping: boolean;
};

export const SwapContext = createContext<SwapContextValue>({
  chainId: CHAIN_ID.SOLANA,
  setFromTokenAddress: () => {},
  setToTokenAddress: () => {},
  setAmount: () => {},
  isRouting: false,
  swap: async () => {},
  isSwapping: false,
});

export type SwapProviderProps = PropsWithChildren<{
  chainId?: CHAIN_ID;
  fromTokenAddress?: string;
  toTokenAddress?: string;
  onComplete?: (options: any) => void;
}>;

export function SwapProvider({
  chainId = CHAIN_ID.SOLANA,
  fromTokenAddress: defaultFromTokenAddress,
  toTokenAddress: defaultToTokenAddress,
  onComplete,
  children,
}: PropsWithChildren<SwapProviderProps>) {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const toast = useTimerToast();

  const { user } = useAuth();

  // 用户余额
  const wallet = useAtomValue(walletBalancesAtom);

  // 支付代币地址
  const [fromTokenAddress, setFromTokenAddress] = useState(defaultFromTokenAddress ?? "");

  useEffect(() => {
    if (defaultFromTokenAddress) {
      setFromTokenAddress(defaultFromTokenAddress);
    }
  }, [defaultFromTokenAddress]);

  // 支付代币信息
  const { data: fromToken, refetch: refetchFromToken } = useTokenQuery(chainId, fromTokenAddress, {
    enabled: !!fromTokenAddress,
  });

  // 定时刷新支付代币信息，以便获取最新价格
  const fromTokenTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (fromToken) {
      if (fromTokenTimerRef.current) {
        clearInterval(fromTokenTimerRef.current);
      }
      fromTokenTimerRef.current = setInterval(refetchFromToken, 10000);
    }
    return () => {
      if (fromTokenTimerRef.current) {
        clearInterval(fromTokenTimerRef.current);
      }
    };
  }, [fromToken, refetchFromToken]);

  // 支付代币余额
  const fromTokenBalance = useMemo(
    () => (wallet?.balances ?? []).find((it) => it.tokenAddress === fromTokenAddress),
    [wallet, fromTokenAddress],
  );

  // 支付代币数量
  const [amount, setAmount] = useState<string | undefined>(undefined);

  // 以代币精度计 支付代币数量
  const amountInDecimals = useMemo(
    () =>
      fromToken?.decimals && amount
        ? new BigNumber(amount).shiftedBy(fromToken.decimals).toString()
        : undefined,
    [amount, fromToken?.decimals],
  );

  // 支付代币金额
  const amountInUsd = useMemo(
    () =>
      amount && fromToken?.marketData?.priceInUsd
        ? new BigNumber(amount).multipliedBy(fromToken.marketData.priceInUsd).toString()
        : undefined,
    [amount, fromToken],
  );

  // 获得代币地址
  const [toTokenAddress, setToTokenAddress] = useState(defaultToTokenAddress ?? "");

  useEffect(() => {
    if (defaultToTokenAddress) {
      setToTokenAddress(defaultToTokenAddress);
    }
  }, [defaultToTokenAddress]);

  // 获得代币信息
  const { data: toToken, refetch: refetchToToken } = useTokenQuery(chainId, toTokenAddress, {
    enabled: !!toTokenAddress,
  });

  // 定时刷新获得代币信息，以便获取最新价格
  const toTokenTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (toToken) {
      if (toTokenTimerRef.current) {
        clearInterval(toTokenTimerRef.current);
      }
      toTokenTimerRef.current = setInterval(refetchToToken, 10000);
    }
    return () => {
      if (toTokenTimerRef.current) {
        clearInterval(toTokenTimerRef.current);
      }
    };
  }, [toToken, refetchToToken]);

  // 获得代币余额
  const toTokenBalance = useMemo(
    () => (wallet?.balances ?? []).find((it) => it.tokenAddress === toTokenAddress),
    [wallet, toTokenAddress],
  );

  // 信息完备，可以计算路由
  const enabled = useMemo(
    () => !!user?.solanaAddress && !!fromTokenAddress && !!toTokenAddress && !!amountInDecimals,
    [user, fromTokenAddress, toTokenAddress, amountInDecimals],
  );

  // 计算路由
  const dexClient = useDexClient();

  const [isRouting, setIsRouting] = useState(false);

  const [routeInfo, setRouteInfo] = useState<SwapRouteResponse | null>(null);

  const [routeError, setRouteError] = useState<string | null>(null);

  const route = useCallback(async () => {
    if (!user?.solanaAddress || !fromTokenAddress || !toTokenAddress || !amountInDecimals) {
      return;
    }
    setIsRouting(true);
    try {
      const res = await fetchSwapRoute(dexClient, {
        chain: CHAIN_ID.SOLANA,
        dex: SwapRouteInputDex.jupiter,
        userAddress: user.solanaAddress,
        amount: amountInDecimals,
        swapMode: SwapRouteInputSwapMode.ExactIn,
        slippage: 20,
        priorityFee: new BigNumber(0.005).shiftedBy(SOL_TOKEN_DECIMALS).toString(),
        tipFee: new BigNumber(0.002).shiftedBy(SOL_TOKEN_DECIMALS).toString(),
        isAntiMev: true,
        inputMint: getWrappedAddress(chainId, fromTokenAddress) ?? fromTokenAddress,
        outputMint: getWrappedAddress(chainId, toTokenAddress) ?? toTokenAddress,
      });
      setRouteInfo(res);
      setRouteError(null);
    } catch (e) {
      console.error("swap route error", e);
      if (e instanceof Error && "response" in e && e.response instanceof Response) {
        try {
          const bodyText = await e.response.text();
          const body = JSON.parse(bodyText ?? "{}") as { message?: string; details?: string };
          setRouteError(body.details ?? body.message ?? t("extend.account.convert_errors.route_error"));
          // eslint-disable-next-line unused-imports/no-unused-vars
        } catch (_e) {
          setRouteError(t("extend.account.convert_errors.route_error"));
        }
      } else {
        setRouteError(t("extend.account.convert_errors.route_error"));
      }
    } finally {
      setIsRouting(false);
    }
  }, [user, chainId, fromTokenAddress, toTokenAddress, amountInDecimals, dexClient, t]);

  // 路由要定时刷新
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 金额变化、地址变化等触发重新计算路由
  useEffect(() => {
    if (enabled) {
      route();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(route, 12000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, route]);

  // const [isSwapping, setIsSwapping] = useState(false);

  const walletInstance = useWallet();

  const { mutateAsync: sendTransactionAsync, isPending: isSwapping } = useSendTransactionMutation();

  const waitSwapConfirmation = useWaitForTransactionConfirmation();

  // 执行兑换
  const swap = useCallback(async () => {
    if (!routeInfo || routeError || isSwapping || !user?.solanaAddress || !walletInstance) return;

    // 停止刷新路由
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // setIsSwapping(true);

    try {
      const serializedTx = routeInfo.serializedTx;

      // sign tx
      const signedTxBuffer = await walletInstance.signTransaction(Buffer.from(serializedTx, "base64"));
      const signedTx = Buffer.from(signedTxBuffer).toString("base64");

      // send tx
      const result = await sendTransactionAsync({
        chain: chainId,
        signedTx,
        submitType: SendTxInputSubmitType.default,
        options: { isAntiMev: true },
      });
      console.info("send swap transaction result", result);

      const txHash = result.signature;

      toast({
        id: txHash,
        type: "success",
        message: t("extend.account.convert_transaction_submitted"),
        progress: true,
        duration: 45000,
      });

      // wait for tx confirmed
      waitSwapConfirmation(
        txHash,
        () => {
          toast({
            id: txHash,
            type: "success",
            duration: 5000,
            message: t("extend.account.convert_transaction_completed"),
            endContent: (
              <Button
                as={Link}
                href={getTxExplorerUrl(chainId, txHash)}
                target="_blank"
                isIconOnly
                className="bg-transparent w-6 min-w-0 h-6 min-h-0"
              >
                <Image src={chainIcon(chainId) ?? ""} width={16} height={16} />
              </Button>
            ),
          });
        },
        () => {
          toast({
            id: txHash,
            type: "error",
            duration: 5000,
            message: t("extend.account.convert_transaction_uncompleted"),
            endContent: (
              <Button
                as={Link}
                href={getTxExplorerUrl(chainId, txHash)}
                target="_blank"
                isIconOnly
                className="bg-transparent w-6 min-w-0 h-6 min-h-0"
              >
                <Image src={chainIcon(chainId) ?? ""} width={16} height={16} />
              </Button>
            ),
          });
        },
      );

      appSdk.events.emit("swap_result", {
        method: "swap_result",
        params: {
          success: true,
          txHash,
        },
      });

      onComplete?.({
        success: true,
        txHash,
      });

      // const conn = new Connection(solanaRpcUrl, "confirmed");
      // const txHash = await wallet.sendTransaction(signedVersionedTx, conn);

      // console.info("send swap transaction txHash", txHash);
    } catch (e: unknown) {
      console.error("send swap transaction error", e);

      if (e instanceof Error && "response" in e && e.response instanceof Response) {
        try {
          const bodyText = await e.response.text();
          const body = JSON.parse(bodyText ?? "{}") as { message?: string; details?: string };
          toast({
            type: "error",
            message: body.details ?? body.message ?? t("extend.account.convert_transaction_error"),
          });
          // eslint-disable-next-line unused-imports/no-unused-vars
        } catch (_e2) {
          toast({
            type: "error",
            message: t("extend.account.convert_transaction_error"),
          });
        }
      } else {
        toast({
          type: "error",
          message: e instanceof Error ? e.message : t("extend.account.convert_transaction_error"),
        });
      }

      onComplete?.({
        success: false,
      });

      appSdk.events.emit("swap_result", {
        method: "swap_result",
        params: {
          success: false,
        },
      });
    } finally {
      // setIsSwapping(false);
    }
  }, [
    t,
    onComplete,
    toast,
    routeInfo,
    routeError,
    user,
    isSwapping,
    chainId,
    sendTransactionAsync,
    waitSwapConfirmation,
    walletInstance,
    appSdk,
  ]);

  const value = useMemo(
    () => ({
      chainId,
      fromTokenAddress,
      fromTokenBalance,
      fromToken,
      setFromTokenAddress,
      toTokenAddress,
      toTokenBalance,
      toToken,
      setToTokenAddress,
      amount,
      amountInUsd,
      setAmount,
      enabled,
      isRouting,
      routeError,
      routeInfo: enabled ? routeInfo : undefined, // routeInfo 有可能是之前计算遗留的结果，因此要根据 enabled 来判断
      swap,
      isSwapping,
    }),
    [
      chainId,
      fromTokenAddress,
      fromTokenBalance,
      fromToken,
      setFromTokenAddress,
      toTokenAddress,
      toTokenBalance,
      toToken,
      setToTokenAddress,
      amount,
      amountInUsd,
      setAmount,
      enabled,
      isRouting,
      routeError,
      routeInfo,
      swap,
      isSwapping,
    ],
  );

  return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>;
}

export function useSwapContext() {
  const context = useContext(SwapContext);
  if (!context) {
    throw new Error("useSwapContext must be used within SwapProvider");
  }
  return context;
}
