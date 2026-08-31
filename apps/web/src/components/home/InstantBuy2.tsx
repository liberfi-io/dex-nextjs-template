"use client";

import { useMemo } from "react";
import { useTranslation } from "@liberfi.io/i18n";
import { Chain } from "@liberfi.io/types";
import { LightningIcon, Button, toast } from "@liberfi.io/ui";
import { formatPrice, getNativeToken, SafeBigNumber } from "@liberfi.io/utils";
import {
  getPrimaryTokenAddress,
  getPrimaryTokenDecimals,
  getPrimaryTokenSymbol,
} from "../../application/tokens";
import { INSTANT_TRADE_AMOUNT_ID, swapFeesFromPreset } from "../../application/swapFees";
import { useWalletPrimaryTokenNetWorth } from "../../application/useWalletPrimaryTokenNetWorth";
import { browserAppSdk } from "../../application/app-sdk";
import {
  useInstantTradeAmount,
  usePresetValues,
  useSwap,
  type SwapPhase,
} from "@liberfi.io/ui-trade";
import { useAuthCallback, useConnectedWallet } from "@liberfi.io/wallet-connector";

export interface InstantBuy2Props {
  chain: Chain;
  tokenAddress: string;
}

export function InstantBuy({ chain, tokenAddress }: InstantBuy2Props) {
  const { t } = useTranslation();

  const nativeToken = useMemo(() => getNativeToken(chain), [chain]);
  const { amount, preset } = useInstantTradeAmount({
    id: INSTANT_TRADE_AMOUNT_ID,
    chain,
    tokenAddress: nativeToken?.address ?? "",
  });
  const walletNetWorth = useWalletPrimaryTokenNetWorth();

  const primaryTokenSymbol = useMemo(() => getPrimaryTokenSymbol(chain), [chain]);
  const primaryTokenDecimals = useMemo(() => getPrimaryTokenDecimals(chain), [chain]);
  const primaryTokenAddress = useMemo(() => getPrimaryTokenAddress(chain), [chain]);

  const presetSettings = usePresetValues({
    chain,
    direction: "buy",
    presetIndex: preset ?? 0,
  });
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

  const handleInstantBuy = useAuthCallback(async () => {
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
        t("trade.buy_min_amount", {
          amount: "0.0001",
          symbol: primaryTokenSymbol ?? "",
        }),
      );
      return;
    }

    if (new SafeBigNumber(walletNetWorth.amount).lt(amount)) {
      toast.error(t("trade.buy_insufficient_balance"));
      browserAppSdk.events.emit("deposit:open");
      return;
    }

    const amountInDecimals = new SafeBigNumber(amount)
      .shiftedBy(primaryTokenDecimals)
      .decimalPlaces(0)
      .toString();
    const fees = swapFeesFromPreset(presetSettings, primaryTokenDecimals);

    await swap({
      chain,
      wallet,
      input: primaryTokenAddress,
      output: tokenAddress,
      amount: amountInDecimals,
      ...fees,
    });
  }, [
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
      startContent={<LightningIcon width={12} height={12} className="flex-none" />}
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
