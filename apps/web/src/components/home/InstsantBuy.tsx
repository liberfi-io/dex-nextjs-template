import { useTranslation } from "@liberfi.io/i18n";
import { LightningIcon, Button, toast } from "@liberfi.io/ui";
import { TokenListActionsProps } from "@liberfi.io/ui-tokens";
import { formatPrice, SafeBigNumber } from "@liberfi.io/utils";
import {
  getPrimaryTokenAddress,
  getPrimaryTokenDecimals,
  getPrimaryTokenSymbol,
} from "../../application/tokens";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import {
  useAppSdk,
  useAuthenticatedCallback,
  useWalletPrimaryTokenNetWorth,
} from "@liberfi/ui-base";
import { defaultTradePresetValues, useTradeBuySettings } from "@liberfi/ui-dex";
import { useSwap, type SwapPhase } from "@liberfi.io/ui-trade";
import { useConnectedWallet } from "@liberfi.io/wallet-connector";
import { useMemo } from "react";
import { useInstantBuy } from "./InstantBuyContext";


export function InstantBuy({ token }: TokenListActionsProps) {
  const { chain: chainId } = useCurrentChain();

  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const { amount, preset } = useInstantBuy();

  const walletNetWorth = useWalletPrimaryTokenNetWorth();

  const primaryTokenSymbol = useMemo(() => getPrimaryTokenSymbol(chainId), [chainId]);

  const primaryTokenDecimals = useMemo(() => getPrimaryTokenDecimals(chainId), [chainId]);

  const primaryTokenAddress = useMemo(() => getPrimaryTokenAddress(chainId), [chainId]);

  const buySettings = useTradeBuySettings(chainId);

  const presetSettings = useMemo(
    () => buySettings?.presets?.[preset ?? 0] ?? defaultTradePresetValues,
    [buySettings, preset],
  );
  const wallet = useConnectedWallet(chainId);

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
      !token.address
    )
      return;

    if (!amount || new SafeBigNumber(amount).lte(0.0001)) {
      toast.error(
        t("extend.trade.buy_min_amount", { amount: "0.0001", symbol: primaryTokenSymbol ?? "" }),
      );
      return;
    }

    // balance is insufficient
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
      chain: chainId,
      wallet,
      input: primaryTokenAddress,
      output: token.address,
      amount: amountInDecimals,
      slippage: presetSettings.slippage ?? defaultTradePresetValues.slippage!,
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
    chainId,
    token.address,
    primaryTokenDecimals,
    primaryTokenAddress,
    swap,
    t,
    wallet,
    walletNetWorth?.amount,
    presetSettings,
  ]);

  return (
    <div className="w-full h-full relative">
      <Button
        color="primary"
        radius="full"
        size="sm"
        startContent={<LightningIcon width={12} height={12} className="flex-none" />}
        endContent={<span>{primaryTokenSymbol}</span>}
        onPress={handleInstantBuy}
        isLoading={isSwapping}
        disableRipple
        className="absolute right-0 top-1/2 -translate-y-1/2"
      >
        {formatPrice(amount ?? 0)}
      </Button>
    </div>
  );
}
