import { useSwapContext } from "@/components/swap/SwapContext";
import { getBuyTokenUrl } from "@/libs";
import { Button, Input } from "@heroui/react";
import { CONFIG } from "@liberfi/core";
import { useAppSdk, useAuth, useTranslation, walletBalancesAtom } from "@liberfi/ui-base";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { debounce } from "lodash-es";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { TradeInputSkeletons } from "./TradeInputSkeletons";

export type TradeInputProps = {
  type: "buy" | "sell";
  displayEmptyWalletError?: boolean;
};

export function TradeInput({ type, displayEmptyWalletError = false }: TradeInputProps) {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const { user } = useAuth();

  const { setAmount, fromToken, fromTokenBalance, routeError } = useSwapContext();

  // 钱包余额
  const wallet = useAtomValue(walletBalancesAtom);

  // 钱包是否为空
  const isWalletEmpty = useMemo(() => {
    if (!wallet || !wallet.balances || wallet.balances.length === 0) return true;
    return wallet.balances.every((balance) => new BigNumber(balance.amount ?? 0).eq(0));
  }, [wallet]);

  // 错误信息
  const [error, setError] = useState<string | undefined>(undefined);

  // 同步路由错误信息
  useEffect(() => {
    setError(routeError ?? undefined);
  }, [routeError, setError]);

  // 输入变化
  const handleAmountChange = useCallback(
    (value: string) => {
      if (!value) {
        setError(undefined);
        setAmount(undefined);
        return;
      }

      const amount = new BigNumber(value);
      const balance = new BigNumber(fromTokenBalance?.amount ?? 0);

      if (amount.lte(0)) {
        setError(t("extend.account.convert_errors.amount_error"));
        setAmount(undefined);
        return;
      }
      if (amount.gt(balance)) {
        setError(t("extend.account.convert_errors.amount_gt_balance"));
        setAmount(undefined);
        return;
      }

      setError(undefined);
      setAmount(value);
    },
    [setAmount, fromTokenBalance, setError, t],
  );

  const debouncedHandleAmountChange = useMemo(
    () => debounce(handleAmountChange, 500),
    [handleAmountChange],
  );

  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      debouncedHandleAmountChange(value);
    },
    [debouncedHandleAmountChange, setInputValue],
  );

  const handleQuickInput = useCallback(
    (ratio: number) => {
      if (!fromTokenBalance || !fromToken) return;
      const value = new BigNumber(fromTokenBalance.amount ?? 0)
        .multipliedBy(ratio)
        .dp(fromToken.decimals, BigNumber.ROUND_FLOOR);
      if (value.gt(0)) {
        const valueStr = value.toString();
        setInputValue(valueStr);
        debouncedHandleAmountChange(valueStr);
      }
    },
    [fromTokenBalance, fromToken, debouncedHandleAmountChange, setInputValue],
  );

  // 交易结束，重置输入框
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (_options: { method: "swap_result"; params: any }) => {
      setInputValue("");
      debouncedHandleAmountChange("");
    };
    appSdk.events.on("swap_result", handler);
    return () => {
      appSdk.events.off("swap_result", handler);
    };
  }, [appSdk, setInputValue, debouncedHandleAmountChange]);

  if (!fromToken) {
    return <TradeInputSkeletons />;
  }

  return (
    <div className="flex flex-col">
      <div className="w-full h-12 flex items-center gap-2 overflow-hidden">
        <div className="flex-1">
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={"0"}
            disabled={!fromTokenBalance}
            classNames={{
              inputWrapper: clsx(
                "h-10 p-0 bg-transparent data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent",
                "group-data-[focus-visible=true]:ring-offset-transparent group-data-[focus-visible=true]:ring-transparent",
              ),
              input: clsx(
                "w-full h-full caret-primary text-3xl font-medium",
                "placeholder:text-placeholder placeholder:text-3xl placeholder:font-medium",
                "scrollbar-hide overflow-hidden text-ellipsis whitespace-nowrap",
              ),
            }}
          />
        </div>
        <div className="flex-0 text-neutral font-bold text-3xl">{fromToken.symbol}</div>
      </div>

      {error && <div className="my-2 text-danger-500 text-xs break-words">{error}</div>}

      {!user && <UnauthenticatedError type={type} />}

      {user && displayEmptyWalletError && isWalletEmpty && <EmptyWalletError />}

      <div className="mt-2 flex justify-between items-center gap-1">
        <Button
          className="flex min-w-0 min-h-0 w-auto h-auto px-2 py-0.5 bg-content3 rounded-full text-neutral text-xs"
          disableRipple
          onPress={() => handleQuickInput(0.1)}
        >
          {"10%"}
        </Button>
        <Button
          className="flex min-w-0 min-h-0 w-auto h-auto px-2 py-0.5 bg-content3 rounded-full text-neutral text-xs"
          disableRipple
          onPress={() => handleQuickInput(0.25)}
        >
          {"25%"}
        </Button>
        <Button
          className="flex min-w-0 min-h-0 w-auto h-auto px-2 py-0.5 bg-content3 rounded-full text-neutral text-xs"
          disableRipple
          onPress={() => handleQuickInput(0.5)}
        >
          {t("extend.account.convert_amount_half")}
        </Button>
        <Button
          className="flex min-w-0 min-h-0 w-auto h-auto px-2 py-0.5 bg-content3 rounded-full text-neutral text-xs"
          disableRipple
          onPress={() => handleQuickInput(0.75)}
        >
          {"75%"}
        </Button>
        <Button
          className="flex min-w-0 min-h-0 w-auto h-auto px-2 py-0.5 bg-content3 rounded-full text-neutral text-xs"
          disableRipple
          onPress={() => handleQuickInput(1)}
        >
          {t("extend.account.convert_amount_max")}
        </Button>
      </div>
    </div>
  );
}

function UnauthenticatedError({ type }: { type: "buy" | "sell" }) {
  const { t } = useTranslation();

  const { signIn } = useAuth();

  const { fromToken, toToken } = useSwapContext();

  const [message1, message2] = useMemo(
    () =>
      t(`extend.trade.operations.${type}_unauthenticated`, {
        token: (type === "buy" ? toToken?.symbol : fromToken?.symbol) ?? "",
      }).split("sign_in"),
    [t, type, fromToken, toToken],
  );

  return (
    <div className="my-2 text-neutral text-xs">
      {message1}
      <span className="text-bullish cursor-pointer" onClick={signIn}>
        {t("extend.common.signin")}
      </span>
      {message2}
    </div>
  );
}

function EmptyWalletError() {
  const { t, i18n } = useTranslation();

  const { user } = useAuth();

  const { chainId } = useSwapContext();

  const appSdk = useAppSdk();

  const onReceive = useCallback(() => {
    appSdk.events.emit("deposit:open");
  }, [appSdk]);

  const onBuy = useCallback(() => {
    const url = getBuyTokenUrl({
      chainId,
      walletAddress: user?.solanaAddress ?? "",
      language: i18n.language,
    });
    appSdk.events.emit("webview:open", {
      method: "webview:open",
      params: {
        url,
        title: t("extend.account.add_cash"),
      },
    });
  }, [appSdk, i18n, t, user, chainId]);

  return (
    <div className="my-2 text-neutral text-xs">
      <span className="text-bullish cursor-pointer" onClick={onBuy}>
        {t("extend.account.add_cash")}
      </span>{" "}
      {t("extend.common.or")}{" "}
      <span className="text-bullish cursor-pointer" onClick={onReceive}>
        {t("extend.account.receive")}
      </span>{" "}
      {t("extend.account.assets.empty_tip", { title: CONFIG.branding.name })}
    </div>
  );
}
