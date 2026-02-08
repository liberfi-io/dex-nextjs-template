import { useSwapContext } from "@/components/swap/SwapContext";
import { useTranslation } from "@liberfi/ui-base";
import { Button } from "@heroui/react";
import { TradeInput } from "./TradeInput";
import { SellAsset } from "./SellAsset";
import clsx from "clsx";

export type SellFormProps = {
  classNames?: {
    sellWrapper?: string;
    sellForm?: string;
  };
  onSubmit: () => void;
};

export function SellForm({ classNames, onSubmit }: SellFormProps) {
  const { t } = useTranslation();

  const { isRouting, fromToken, routeInfo, routeError } = useSwapContext();

  return (
    <div className={clsx("w-full flex flex-col", classNames?.sellWrapper)}>
      <div className={clsx("p-3 bg-content2 rounded-lg", classNames?.sellForm)}>
        <SellAsset />
        <TradeInput type="sell" />
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
        {!fromToken && <>{t("extend.trade.operations.sell")}</>}
        {!!fromToken && (
          <>
            {t("extend.trade.operations.sell")} {fromToken.symbol}
          </>
        )}
      </Button>
    </div>
  );
}
