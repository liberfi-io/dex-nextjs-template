import { ArrowDownIcon, WithdrawOutlinedIcon } from "../../assets";
import { useAppSdk, useTranslation } from "@liberfi/ui-base";
import { Button, Input } from "@heroui/react";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { debounce } from "lodash-es";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Number } from "../Number";
import { TokenAvatar } from "../TokenAvatar";
import { useTransferContext } from "./TransferContext";

export function TokenAmountInput() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const { setTokenAddress, token, tokenBalance, setAmount, amountInUsd, transactionError } =
    useTransferContext();

  // 错误信息
  const [error, setError] = useState<string | undefined>(undefined);

  // 同步创建交易错误信息
  useEffect(() => {
    const message = t("extend.account.transfer_errors.create_transaction_error");
    if (transactionError) {
      setError(message);
    } else {
      setError((prev) => (prev === message ? undefined : prev));
    }
  }, [transactionError, setError, t]);

  // 输入变化
  const handleAmountChange = useCallback(
    (value: string) => {
      if (!value) {
        setError(undefined);
        setAmount(undefined);
        return;
      }

      if (!tokenBalance) return;

      const amount = new BigNumber(value);
      const balance = new BigNumber(tokenBalance.amount ?? 0);

      if (amount.lte(0)) {
        setError(t("extend.account.transfer_errors.amount_error"));
        setAmount(undefined);
        return;
      }
      if (amount.gt(balance)) {
        setError(t("extend.account.transfer_errors.amount_gt_balance"));
        setAmount(undefined);
        return;
      }

      setError(undefined);
      setAmount(value);
    },
    [setAmount, tokenBalance, setError, t],
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

  // 快捷输入
  const handleHalfAmount = useCallback(() => {
    if (!tokenBalance || !token) return;
    const value = new BigNumber(tokenBalance.amount ?? 0)
      .div(2)
      .dp(token.decimals, BigNumber.ROUND_FLOOR)
      .toString();
    setInputValue(value);
    debouncedHandleAmountChange(value);
  }, [tokenBalance, token, debouncedHandleAmountChange, setInputValue]);

  const handleMaxAmount = useCallback(() => {
    if (!tokenBalance || !token) return;
    const value = new BigNumber(tokenBalance.amount ?? 0)
      .dp(token.decimals, BigNumber.ROUND_FLOOR)
      .toString();
    setInputValue(value);
    debouncedHandleAmountChange(value);
  }, [tokenBalance, token, debouncedHandleAmountChange, setInputValue]);

  // 打开代币选择
  const [requestId, setRequestId] = useState<number | undefined>(undefined);
  const handleSelectToken = useCallback(() => {
    const id = Date.now();
    appSdk.events.emit("select_asset", { method: "select_asset", id, params: {} });
    setRequestId(id);
  }, [appSdk, setRequestId]);

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
        setTokenAddress(options.params.tokenAddress);
      }
    };
    appSdk.events.on("response", handler);
    return () => {
      appSdk.events.off("response", handler);
    };
  }, [appSdk, requestId, setInputValue, setError, setAmount, setTokenAddress]);

  return (
    <div className="space-y-3">
      <p className="text-neutral font-medium text-sm">{t("extend.account.transfer_from")}</p>
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
                tokenBalance ? "text-foreground" : "text-neutral",
              )}
              disableRipple
              startContent={
                tokenBalance && (
                  <TokenAvatar
                    size={24}
                    src={tokenBalance.logoUri ?? token?.imageUrl ?? ""}
                    name={tokenBalance.symbol}
                  />
                )
              }
              endContent={<ArrowDownIcon width={16} height={16} className="text-neutral" />}
              onPress={handleSelectToken}
            >
              {tokenBalance ? tokenBalance.symbol : t("extend.account.select_asset")}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex-1 text-neutral text-xs max-sm:text-xxs">
            ≈ <Number value={amountInUsd ?? 0} abbreviate defaultCurrencySign="$" />
          </div>
          {tokenBalance && (
            <div className="flex-0 flex items-center gap-2 pr-3 text-xs max-sm:text-xxs">
              <WithdrawOutlinedIcon width={12} hanging={12} className="text-neutral" />
              <span className="text-neutral">
                {tokenBalance ? <Number value={tokenBalance.amount} abbreviate /> : "--"}{" "}
                {tokenBalance ? tokenBalance.symbol : ""}
              </span>
              <span className="text-primary cursor-pointer" onClick={handleHalfAmount}>
                {t("extend.account.transfer_amount_half")}
              </span>
              <span className="text-primary cursor-pointer" onClick={handleMaxAmount}>
                {t("extend.account.transfer_amount_max")}
              </span>
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-danger-500 text-xs max-sm:text-xxs">{error}</p>}
      </div>
    </div>
  );
}
