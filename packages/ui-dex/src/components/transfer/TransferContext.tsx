import { isValidWalletAddress } from "../../libs";
import BigNumber from "bignumber.js";
import { CHAIN_ID } from "@liberfi/core";
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
import { Token, WalletNetWorthItemDTO } from "@chainstream-io/sdk";
import {
  chainAtom,
  useAppSdk,
  useAuth,
  useTimerToast,
  useTranslation,
  useWallet,
  walletNetWorthAtom,
} from "@liberfi/ui-base";
import { ClientError } from "graphql-request";
import { useAtomValue } from "jotai";
import {
  UnsignedTransactionDto,
  useCreateTransferTransactionMutation,
  useSendTransferTransactionMutation,
} from "@liberfi/react-backend";
import { useTokenQuery } from "@liberfi/react-dex";

export type TransferContextValue = {
  tokenAddress?: string | null;
  tokenBalance?: WalletNetWorthItemDTO | null;
  token?: Token | null;
  setTokenAddress: (tokenAddress: string) => void;
  walletAddress?: string | null;
  setWalletAddress: (walletAddress: string) => void;
  amount?: string;
  amountInUsd?: string;
  setAmount: (amount: string | undefined) => void;
  transaction?: UnsignedTransactionDto | null;
  transactionError?: Error | null;
  isCreatingTransaction: boolean;
  transfer: () => Promise<void>;
  isTransferring: boolean;
};

export const TransferContext = createContext<TransferContextValue>({
  setTokenAddress: () => {},
  setWalletAddress: () => {},
  setAmount: () => {},
  isCreatingTransaction: false,
  transfer: async () => {},
  isTransferring: false,
});

export type TransferProviderProps = PropsWithChildren<{
  tokenAddress?: string;
  walletAddress?: string;
  onComplete?: (options: { success: boolean; txHash?: string }) => void;
}>;

export function TransferProvider({
  tokenAddress: defaultTokenAddress,
  walletAddress: defaultWalletAddress,
  onComplete,
  children,
}: PropsWithChildren<TransferProviderProps>) {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const toast = useTimerToast();

  const { user } = useAuth();

  const chain = useAtomValue(chainAtom);

  // 用户账户余额
  const walletNetWorth = useAtomValue(walletNetWorthAtom);

  // 代币地址
  const [tokenAddress, setTokenAddress] = useState(defaultTokenAddress ?? "");

  useEffect(() => {
    if (defaultTokenAddress) {
      setTokenAddress(defaultTokenAddress);
    }
  }, [defaultTokenAddress]);

  // 代币信息
  const { data: token, refetch: refetchToken } = useTokenQuery(chain, tokenAddress);

  // 定时刷新代币信息，以便获取最新价格
  const tokenTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (token) {
      if (tokenTimerRef.current) {
        clearInterval(tokenTimerRef.current);
      }
      tokenTimerRef.current = setInterval(refetchToken, 10000);
    }
    return () => {
      if (tokenTimerRef.current) {
        clearInterval(tokenTimerRef.current);
      }
    };
  }, [token, refetchToken]);

  // 代币余额
  const tokenBalance = useMemo(
    () => (walletNetWorth?.data ?? []).find((it) => it.tokenAddress === tokenAddress),
    [walletNetWorth, tokenAddress],
  );

  // 转账代币数量
  const [amount, setAmount] = useState<string | undefined>(undefined);

  // 以代币精度计 转账代币数量
  const amountInDecimals = useMemo(
    () =>
      token?.decimals && amount
        ? new BigNumber(amount).shiftedBy(token.decimals).toString()
        : undefined,
    [amount, token?.decimals],
  );

  // 转账代币金额
  const amountInUsd = useMemo(
    () =>
      amount && token?.marketData?.priceInUsd
        ? new BigNumber(amount).multipliedBy(token.marketData.priceInUsd).toString()
        : undefined,
    [amount, token],
  );

  // 转账钱包地址
  const [walletAddress, setWalletAddress] = useState(defaultWalletAddress ?? "");

  useEffect(() => {
    if (defaultWalletAddress) {
      setWalletAddress(defaultWalletAddress);
    }
  }, [defaultWalletAddress]);

  // 钱包地址是否合法
  const isWalletAddressValid = useMemo(() => {
    if (!walletAddress) return false;
    if (walletAddress === user?.solanaAddress) return false;
    return isValidWalletAddress(CHAIN_ID.SOLANA, walletAddress);
  }, [walletAddress, user?.solanaAddress]);

  // 信息完备，可以创建交易
  const enabled = useMemo(
    () =>
      !!user?.solanaAddress &&
      !!tokenAddress &&
      !!walletAddress &&
      !!amountInDecimals &&
      isWalletAddressValid,
    [user?.solanaAddress, tokenAddress, walletAddress, amountInDecimals, isWalletAddressValid],
  );

  // 创建交易
  const {
    data: transaction,
    mutateAsync: createTransferTransactionAsync,
    isPending: isCreatingTransaction,
    error: transactionError,
  } = useCreateTransferTransactionMutation();

  const createTransaction = useCallback(async () => {
    if (
      !user?.solanaAddress ||
      !tokenAddress ||
      !walletAddress ||
      !amountInDecimals ||
      !isWalletAddressValid
    ) {
      return;
    }

    createTransferTransactionAsync({
      sourceAddress: user.solanaAddress,
      destinationAddress: walletAddress,
      mintAddress: tokenAddress,
      amount: amountInDecimals,
    });
  }, [
    user?.solanaAddress,
    tokenAddress,
    walletAddress,
    amountInDecimals,
    isWalletAddressValid,
    createTransferTransactionAsync,
  ]);

  // 定时刷新交易
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 参数变化触发重新创建交易
  useEffect(() => {
    if (enabled) {
      createTransaction();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(createTransaction, 10000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [createTransaction, enabled]);

  const { mutateAsync: sendTransactionAsync, isPending: isTransferring } =
    useSendTransferTransactionMutation();

  const walletInstance = useWallet();

  const transfer = useCallback(async () => {
    if (
      !transaction ||
      transactionError ||
      isCreatingTransaction ||
      isTransferring ||
      !user?.solanaAddress ||
      !walletInstance
    )
      return;

    // 停止刷新交易
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      const serializedTx = transaction.serializedTx;

      // sign tx
      const signedTxBuffer = await walletInstance.signTransaction(
        Buffer.from(serializedTx, "base64"),
      );
      const signedTx = Buffer.from(signedTxBuffer).toString("base64");

      // send tx
      const result = await sendTransactionAsync({ signedTx });
      console.info("send transaction result", result);

      const txHash = result.txSignature;

      toast({
        id: txHash,
        type: "success",
        message: t("extend.account.transfer_transaction_submitted"),
        progress: true,
        duration: 45000,
      });

      appSdk.events.emit("transfer_result", {
        method: "transfer_result",
        params: {
          success: true,
          txHash: result?.txSignature,
        },
      });

      onComplete?.({
        success: true,
        txHash: result?.txSignature,
      });
    } catch (error: unknown) {
      console.error("transfer error", error);

      let message: string | undefined;
      if (error instanceof ClientError) {
        message = error.response.errors?.[0]?.message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      toast({
        type: "error",
        message: message ?? t("extend.account.transfer_transaction_error"),
        duration: 5000,
      });

      appSdk.events.emit("transfer_result", {
        method: "transfer_result",
        params: {
          success: false,
        },
      });

      onComplete?.({
        success: false,
      });
    }
  }, [
    transaction,
    transactionError,
    isCreatingTransaction,
    isTransferring,
    user,
    t,
    appSdk,
    onComplete,
    sendTransactionAsync,
    toast,
    walletInstance,
  ]);

  const value = useMemo(
    () => ({
      tokenAddress,
      tokenBalance,
      token,
      setTokenAddress,
      walletAddress,
      setWalletAddress,
      amount,
      amountInUsd,
      setAmount,
      enabled,
      transaction,
      transactionError,
      isCreatingTransaction,
      transfer,
      isTransferring,
    }),
    [
      tokenAddress,
      tokenBalance,
      token,
      setTokenAddress,
      walletAddress,
      setWalletAddress,
      amount,
      amountInUsd,
      setAmount,
      enabled,
      transaction,
      transactionError,
      isCreatingTransaction,
      transfer,
      isTransferring,
    ],
  );

  return <TransferContext.Provider value={value}>{children}</TransferContext.Provider>;
}

export function useTransferContext() {
  const context = useContext(TransferContext);
  if (!context) {
    throw new Error("useTransferContext must be used within TransferProvider");
  }
  return context;
}
