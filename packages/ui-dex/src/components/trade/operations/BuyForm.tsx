/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSwapContext } from "@/components/swap/SwapContext";
import { useTranslation } from "@liberfi/ui-base";
import { Button } from "@heroui/react";
import { BuyAsset } from "./BuyAsset";
import { TradeInput } from "./TradeInput";
import { Number } from "@/components/Number";
import { useMemo } from "react";
import BigNumber from "bignumber.js";
import clsx from "clsx";

export type BuyFormProps = {
  classNames?: {
    buyWrapper?: string;
    buyForm?: string;
  };
  onSubmit: () => void;
};

export function BuyForm({ classNames, onSubmit }: BuyFormProps) {
  const { t } = useTranslation();

  const { isRouting, toToken, routeInfo, routeError } = useSwapContext();

  // 预览的买入代币数量
  const buyAmount = useMemo(() => {
    if (!toToken || !routeInfo) return undefined;
    return new BigNumber((routeInfo.routeInfo as any).outAmount)
      .shiftedBy(-toToken.decimals)
      .toString();
  }, [routeInfo, toToken]);

  return (
    <div className={clsx("w-full flex flex-col", classNames?.buyWrapper)}>
      <div className={clsx("p-3 bg-content2 rounded-lg", classNames?.buyForm)}>
        <BuyAsset />
        <TradeInput type="buy" displayEmptyWalletError />
      </div>

      <Button
        fullWidth
        color="primary"
        className="flex mt-2 rounded-lg"
        disableRipple
        isDisabled={!routeInfo || !!routeError}
        isLoading={!routeInfo && isRouting}
        onPress={onSubmit}
      >
        {!toToken && !routeInfo && <>{t("extend.trade.operations.buy")}</>}
        {!!toToken && !routeInfo && (
          <>
            {t("extend.trade.operations.buy")} {toToken.symbol}
          </>
        )}
        {!!toToken && !!routeInfo && (
          <>
            {t("extend.trade.operations.buy")} <Number value={buyAmount ?? 0} abbreviate />{" "}
            {toToken.symbol}
          </>
        )}
      </Button>
    </div>
  );
}
