"use client";

import { useMemo } from "react";
import { useTranslation } from "@liberfi.io/i18n";
import { Chain } from "@liberfi.io/types";
import { LightningIcon, Button, toast } from "@liberfi.io/ui";
import { formatPrice, SafeBigNumber } from "@liberfi.io/utils";
import {
  getPrimaryTokenAddress,
  getPrimaryTokenDecimals,
  getPrimaryTokenSymbol,
} from "../../application/tokens";
import {
  useAppSdk,
  useAuthenticatedCallback,
  useWalletPrimaryTokenNetWorth,
} from "@liberfi/ui-base";
import { defaultTradePresetValues, useTradeBuySettings } from "@liberfi/ui-dex";
import { useSwap, type SwapPhase } from "@liberfi.io/ui-trade";
import { useConnectedWallet } from "@liberfi.io/wallet-connector";
import { useInstantBuy } from "./InstantBuyContext";

export interface InstantBuy2Props {
  chain: Chain;
  tokenAddress: string;
}

export function InstantBuy({ chain, tokenAddress }: InstantBuy2Props) {
  const { t } = useTranslation();
  const appSdk = useAppSdk();
  const { amount, preset } = useInstantBuy();
  const walletNetWorth = useWalletPrimaryTokenNetWorth();

  const primaryTokenSymbol = useMemo(
    () => getPrimaryTokenSymbol(chain),
    [chain],
  );
  const primaryTokenDecimals = useMemo(
    () => getPrimaryTokenDecimals(chain),
    [chain],
  );
  const primaryTokenAddress = useMemo(
    () => getPrimaryTokenAddress(chain),
    [chain],
  );

  const buySettings = useTradeBuySettings(chain);
  const presetSettings = useMemo(
    () => buySettings?.presets?.[preset ?? 0] ?? defaultTradePresetValues,
    [buySettings, preset],
  );
  const wallet = useConnectedWallet(chain);

  const handleSwapError = (error: Error, phase: SwapPhase) => {
    const phaseLabel = t(`trade.swap.phase.${phase}`);
    const message = error.message
      ? t("trade.swap.error", { phase: phaseLabel, reason: error.message })
      : t("trade.swap.errorUnknown", { phase: phaseLabel });
    toast.error(message);
  };

  const { swap, isSwapping } = useSwap({
    onSubmitted: ({ txHash }) => {
      toast.progress({
        id: txHash,
        type: "success",
        message: t("trade.swap.transactionSubmitted"),
        progress: true,
        duration: 65_000,
      });
    },
    onError: handleSwapError,
  });

  const handleInstantBuy = useAuthenticatedCallback(async () => {
    if (
      !walletNetWorth?.amount ||
      !wallet ||
      !primaryTokenAddress ||
      !primaryTokenDecimals ||
      !tokenAddress
    )
      return;

    if (!amount || new SafeBigNumber(amount).lte(0.0001)) {
      toast.error(
        t("extend.trade.buy_min_amount", {
          amount: "0.0001",
          symbol: primaryTokenSymbol ?? "",
        }),
      );
      return;
    }

    if (new SafeBigNumber(walletNetWorth.amount).lt(amount)) {
      toast.error(t("extend.trade.buy_insufficient_balance"));
      appSdk.events.emit("deposit:open");
      return;
    }

    const amountInDecimals = new SafeBigNumber(amount)
      .shiftedBy(primaryTokenDecimals)
      .decimalPlaces(0)
      .toString();

    const priorityFeeInDecimals = new SafeBigNumber(
      presetSettings.priorityFee ?? defaultTradePresetValues.priorityFee!,
    )
      .shiftedBy(primaryTokenDecimals)
      .decimalPlaces(0)
      .toString();

    const tipFeeInDecimals = new SafeBigNumber(
      presetSettings.tipFee ?? defaultTradePresetValues.tipFee!,
    )
      .shiftedBy(primaryTokenDecimals)
      .decimalPlaces(0)
      .toString();

    await swap({
      chain,
      wallet,
      input: primaryTokenAddress,
      output: tokenAddress,
      amount: amountInDecimals,
      slippage:
        presetSettings.slippage ?? defaultTradePresetValues.slippage!,
      priorityFee: priorityFeeInDecimals,
      tipFee: tipFeeInDecimals,
      isAntiMev:
        typeof presetSettings.antiMev === "boolean"
          ? presetSettings.antiMev
          : presetSettings.antiMev !== "off",
    });
  }, [
    appSdk,
    amount,
    chain,
    tokenAddress,
    primaryTokenDecimals,
    primaryTokenAddress,
    swap,
    t,
    wallet,
    walletNetWorth?.amount,
    presetSettings,
  ]);

  return (
    <Button
      color="primary"
      radius="full"
      size="sm"
      startContent={
        <LightningIcon width={12} height={12} className="flex-none" />
      }
      endContent={<span>{primaryTokenSymbol}</span>}
      onPress={handleInstantBuy}
      isLoading={isSwapping}
      disableRipple
      className="w-auto min-w-auto absolute right-0 -bottom-4"
    >
      {formatPrice(amount ?? 0)}
    </Button>
  );
}
