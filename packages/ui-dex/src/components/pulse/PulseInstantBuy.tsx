import { useMemo } from "react";
import { clsx } from "clsx";
import { BigNumber } from "bignumber.js";
import { Button } from "@heroui/react";
import { Token } from "@chainstream-io/sdk";
import {
  formatAmount,
  getPrimaryTokenAddress,
  getPrimaryTokenDecimals,
  getPrimaryTokenSymbol,
  RecursivePartial,
} from "@liberfi/core";
import { chainIdBySlug } from "@liberfi.io/utils";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  LightningIcon,
  useAppSdk,
  useAuthenticatedCallback,
  useTranslation,
  useWalletPrimaryTokenNetWorth,
} from "@liberfi/ui-base";
import { usePulseListContext } from "./PulseListContext";
import { useSwap, useTradeBuySettings } from "../../hooks";
import { defaultTradePresetValues } from "../../types";
import { useAtomValue } from "jotai";
import { toast } from "react-hot-toast";
import { pulseSettingsAtom } from "../../states";

export type PulseInstantBuyProps = {
  token: RecursivePartial<Token>;
};

export function PulseInstantBuy({ token }: PulseInstantBuyProps) {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const { instantBuyAmount, type } = usePulseListContext();

  const { chain: defaultChain } = useCurrentChain();

  const chain = useMemo(
    () => chainIdBySlug(token.chain ?? "") ?? defaultChain,
    [token.chain, defaultChain],
  );

  const pulseSettings = useAtomValue(pulseSettingsAtom);

  const buySettings = useTradeBuySettings(chain);

  const presetSettings = useMemo(
    () =>
      buySettings?.presets?.[pulseSettings[type]?.instant_buy?.preset ?? 0] ??
      defaultTradePresetValues,
    [buySettings, pulseSettings, type],
  );

  const primaryTokenNetWorth = useWalletPrimaryTokenNetWorth();

  const primaryTokenSymbol = useMemo(
    () => (chain ? getPrimaryTokenSymbol(chain) : undefined),
    [chain],
  );

  const primaryTokenDecimals = useMemo(
    () => (chain ? getPrimaryTokenDecimals(chain) : undefined),
    [chain],
  );

  const primaryTokenAddress = useMemo(
    () => (chain ? getPrimaryTokenAddress(chain) : undefined),
    [chain],
  );

  const { swap } = useSwap();

  const handleInstantBuy = useAuthenticatedCallback(async () => {
    if (
      !primaryTokenNetWorth?.amount ||
      !primaryTokenAddress ||
      !primaryTokenDecimals ||
      !token.address
    )
      return;

    if (!instantBuyAmount || new BigNumber(instantBuyAmount).lte(0.0001)) {
      toast.error(
        t("extend.trade.buy_min_amount", { amount: "0.0001", symbol: primaryTokenSymbol ?? "" }),
      );
      return;
    }

    // balance is insufficient
    if (new BigNumber(primaryTokenNetWorth.amount).lt(instantBuyAmount)) {
      toast.error(t("extend.trade.buy_insufficient_balance"));
      appSdk.events.emit("deposit:open");
      return;
    }

    const amountInDecimals = new BigNumber(instantBuyAmount)
      .shiftedBy(primaryTokenDecimals)
      .decimalPlaces(0)
      .toString();

    const priorityFeeInDecimals = new BigNumber(
      presetSettings.priorityFee ?? defaultTradePresetValues.priorityFee!,
    )
      .shiftedBy(primaryTokenDecimals)
      .decimalPlaces(0)
      .toString();

    const tipFeeInDecimals = new BigNumber(
      presetSettings.tipFee ?? defaultTradePresetValues.tipFee!,
    )
      .shiftedBy(primaryTokenDecimals)
      .decimalPlaces(0)
      .toString();

    await swap({
      from: primaryTokenAddress,
      to: token.address,
      amount: amountInDecimals,
      slippage: presetSettings.slippage ?? defaultTradePresetValues.slippage!,
      priorityFee: priorityFeeInDecimals,
      tipFee: tipFeeInDecimals,
      isAntiMev: presetSettings.antiMev,
    });
  }, [
    appSdk,
    instantBuyAmount,
    token.address,
    primaryTokenDecimals,
    primaryTokenAddress,
    swap,
    primaryTokenNetWorth?.amount,
    presetSettings,
  ]);

  return (
    <Button
      color="primary"
      className={clsx(
        "absolute w-auto min-w-0 h-auto min-h-0 bottom-0 right-0 px-2 py-1 gap-0.5 rounded-full",
        "text-xs font-bold",
      )}
      startContent={<LightningIcon width={12} height={12} className="flex-none mr-1" />}
      endContent={<span>{primaryTokenSymbol}</span>}
      onPress={handleInstantBuy}
      disableRipple
    >
      {formatAmount(instantBuyAmount ?? 0)}
    </Button>
  );
}
