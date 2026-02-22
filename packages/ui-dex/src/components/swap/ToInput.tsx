/* eslint-disable @typescript-eslint/no-explicit-any */
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input } from "@heroui/react";
import { ArrowDownIcon, WithdrawOutlinedIcon } from "../../assets";
import { useAppSdk, useTranslation } from "@liberfi/ui-base";
import { Number } from "../Number";
import { TokenAvatar } from "../TokenAvatar";
import { useSwapContext } from "./SwapContext";

export function ToInput() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const { toTokenBalance, toToken, setToTokenAddress, routeInfo } = useSwapContext();

  // 选择获得代币
  const [requestId, setRequestId] = useState<number | undefined>(undefined);

  const handleSelectToToken = useCallback(() => {
    const id = Date.now();
    appSdk.events.emit("select_token", { method: "select_token", id, params: undefined });
    setRequestId(id);
  }, [appSdk, setRequestId]);

  useEffect(() => {
    const handler = (options: {
      method: "response";
      id?: number | undefined;
      params: { tokenAddress: string };
    }) => {
      if (options.id === requestId) {
        setToTokenAddress(options.params.tokenAddress);
      }
    };
    appSdk.events.on("response", handler);
    return () => {
      appSdk.events.off("response", handler);
    };
  }, [appSdk, requestId, setToTokenAddress]);

  // 输入框展示获得数量
  const inputValue = useMemo(
    () =>
      routeInfo
        ? new BigNumber((routeInfo.routeInfo as any).outAmount)
            .shiftedBy(-(toToken?.decimals ?? 9))
            .toString()
        : "",
    [routeInfo, toToken],
  );

  // 估算价格
  const amountInUsd = useMemo(
    () =>
      routeInfo
        ? new BigNumber((routeInfo.routeInfo as any).outAmount)
            .shiftedBy(-(toToken?.decimals ?? 9))
            .multipliedBy(toToken?.marketData?.priceInUsd ?? 0)
            .toString()
        : "0",
    [routeInfo, toToken],
  );

  return (
    <div className="mt-4 space-y-3">
      <p className="text-neutral font-medium text-sm">{t("extend.account.convert_to")}</p>
      <div className="bg-content1 flex flex-col rounded-lg px-3.5 pb-2.5 pt-2">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              value={inputValue}
              type="number"
              disabled
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
                toToken ? "text-foreground" : "text-neutral",
              )}
              disableRipple
              startContent={
                toToken && (
                  <TokenAvatar size={24} src={toToken.imageUrl ?? ""} name={toToken?.symbol} />
                )
              }
              endContent={<ArrowDownIcon width={16} height={16} className="text-neutral" />}
              onPress={handleSelectToToken}
            >
              {toToken ? toToken.symbol : t("extend.account.select_asset")}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex-1 text-neutral text-xs max-sm:text-xxs">
            ≈
            <Number value={amountInUsd} abbreviate defaultCurrencySign="$" />
          </div>
          {toTokenBalance && (
            <div className="flex-0 flex items-center gap-2 pr-3 text-xs max-sm:text-xxs">
              <WithdrawOutlinedIcon width={12} hanging={12} className="text-neutral" />
              <span className="text-neutral">
                {toTokenBalance ? <Number value={toTokenBalance.amount} abbreviate /> : "--"}{" "}
                {toTokenBalance ? toTokenBalance.symbol : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
