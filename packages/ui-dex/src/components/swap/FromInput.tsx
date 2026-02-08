import BigNumber from "bignumber.js";
import clsx from "clsx";
import { debounce } from "lodash-es";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownIcon, WithdrawOutlinedIcon } from "@/assets";
import { useAppSdk, useTranslation } from "@liberfi/ui-base";
import { Button, Input } from "@heroui/react";
import { Number } from "../Number";
import { TokenAvatar } from "../TokenAvatar";
import { useSwapContext } from "./SwapContext";

export function FromInput() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const {
    chainId,
    fromTokenBalance,
    fromToken,
    setFromTokenAddress,
    amountInUsd,
    setAmount,
    routeError,
  } = useSwapContext();

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

      if (!fromTokenBalance) return;

      const amount = new BigNumber(value);
      const balance = new BigNumber(fromTokenBalance.amount ?? 0);

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

  const handleHalfAmount = useCallback(() => {
    if (!fromTokenBalance || !fromToken) return;
    const value = new BigNumber(fromTokenBalance.amount ?? 0)
      .div(2)
      .dp(fromToken.decimals, BigNumber.ROUND_FLOOR)
      .toString();
    setInputValue(value);
    debouncedHandleAmountChange(value);
  }, [fromTokenBalance, fromToken, debouncedHandleAmountChange, setInputValue]);

  const handleMaxAmount = useCallback(() => {
    if (!fromTokenBalance || !fromToken) return;
    const value = new BigNumber(fromTokenBalance.amount ?? 0)
      .dp(fromToken.decimals, BigNumber.ROUND_FLOOR)
      .toString();
    setInputValue(value);
    debouncedHandleAmountChange(value);
  }, [fromTokenBalance, fromToken, debouncedHandleAmountChange, setInputValue]);

  // 打开代币选择
  const [requestId, setRequestId] = useState<number | undefined>(undefined);
  const handleSelectFromToken = useCallback(() => {
    const id = Date.now();
    appSdk.events.emit("select_asset", { method: "select_asset", id, params: { chainId } });
    setRequestId(id);
  }, [appSdk, chainId, setRequestId]);

  // 代币选择结果
  useEffect(() => {
    const handler = (options: {
      method: "response";
      id?: number | undefined;
      params: { tokenAddress: string };
    }) => {
      if (options.id === requestId) {
        setInputValue("");
        setError(undefined);
        setAmount(undefined);
        setFromTokenAddress(options.params.tokenAddress);
        // setFromTokenAddress("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
      }
    };
    appSdk.events.on("response", handler);
    return () => {
      appSdk.events.off("response", handler);
    };
  }, [appSdk, requestId, setInputValue, setError, setAmount, setFromTokenAddress]);

  return (
    <div className="space-y-3">
      <p className="text-neutral font-medium text-sm">{t("extend.account.convert_from")}</p>
      <div className="bg-content1 flex flex-col rounded-lg px-3.5 pb-2.5 pt-2">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={"0"}
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
          <div className="flex-0 h-full flex items-center justify-center">
            <Button
              className={clsx(
                "flex min-w-0 h-8 min-h-8 pl-3 pr-2 bg-content3 rounded-full",
                fromTokenBalance ? "text-foreground" : "text-neutral",
              )}
              disableRipple
              startContent={
                fromTokenBalance && (
                  <TokenAvatar
                    size={24}
                    src={fromTokenBalance.imageUrl}
                    name={fromTokenBalance.symbol}
                  />
                )
              }
              endContent={<ArrowDownIcon width={16} height={16} className="text-neutral" />}
              onPress={handleSelectFromToken}
            >
              {fromTokenBalance ? fromTokenBalance.symbol : t("extend.account.select_asset")}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex-1 text-neutral text-xs max-sm:text-xxs">
            ≈ <Number value={amountInUsd ?? 0} abbreviate defaultCurrencySign="$" />
          </div>
          {fromTokenBalance && (
            <div className="flex-0 flex items-center gap-2 pr-3 text-xs max-sm:text-xxs">
              <WithdrawOutlinedIcon width={12} hanging={12} className="text-neutral" />
              <span className="text-neutral">
                {fromTokenBalance ? <Number value={fromTokenBalance.amount} abbreviate /> : "--"}{" "}
                {fromTokenBalance ? fromTokenBalance.symbol : ""}
              </span>
              <span className="text-primary cursor-pointer" onClick={handleHalfAmount}>
                {t("extend.account.convert_amount_half")}
              </span>
              <span className="text-primary cursor-pointer" onClick={handleMaxAmount}>
                {t("extend.account.convert_amount_max")}
              </span>
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-danger-500 text-xs max-sm:text-xxs break-words">{error}</p>}
      </div>
    </div>
  );
}
