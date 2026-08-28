import { useTranslation } from "@liberfi.io/i18n";
import { LightningIcon, Button, toast } from "@liberfi.io/ui";
import { TokenListActionsProps } from "@liberfi.io/ui-tokens";
import { formatPrice, getNativeToken, SafeBigNumber } from "@liberfi.io/utils";
import {
  getPrimaryTokenAddress,
  getPrimaryTokenDecimals,
  getPrimaryTokenSymbol,
} from "../../application/tokens";
import { INSTANT_TRADE_AMOUNT_ID, swapFeesFromPreset } from "../../application/swapFees";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useWalletPrimaryTokenNetWorth } from "../../application/useWalletPrimaryTokenNetWorth";
import { useAppSdk } from "@liberfi/ui-base";
import { useInstantTradeAmount, usePresetValues, useSwap, type SwapPhase } from "@liberfi.io/ui-trade";
import { useAuthCallback, useConnectedWallet } from "@liberfi.io/wallet-connector";
import { useMemo } from "react";


export function InstantBuy({ token }: TokenListActionsProps) {
  const { chain: chainId } = useCurrentChain();

  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const nativeToken = useMemo(() => getNativeToken(chainId), [chainId]);
  const { amount, preset } = useInstantTradeAmount({
    id: INSTANT_TRADE_AMOUNT_ID,
    chain: chainId,
    tokenAddress: nativeToken?.address ?? "",
  });

  const walletNetWorth = useWalletPrimaryTokenNetWorth();

  const primaryTokenSymbol = useMemo(() => getPrimaryTokenSymbol(chainId), [chainId]);

  const primaryTokenDecimals = useMemo(() => getPrimaryTokenDecimals(chainId), [chainId]);

  const primaryTokenAddress = useMemo(() => getPrimaryTokenAddress(chainId), [chainId]);

  const presetSettings = usePresetValues({
    chain: chainId,
    direction: "buy",
    presetIndex: preset ?? 0,
  });
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

  const handleInstantBuy = useAuthCallback(async () => {
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
    const fees = swapFeesFromPreset(presetSettings, primaryTokenDecimals);

    await swap({
      chain: chainId,
      wallet,
      input: primaryTokenAddress,
      output: token.address,
      amount: amountInDecimals,
      ...fees,
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
