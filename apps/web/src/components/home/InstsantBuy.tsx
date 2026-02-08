import { useTranslation } from "@liberfi.io/i18n";
import { LightningIcon, StyledButton, toast } from "@liberfi.io/ui";
import { TokenListActionsProps } from "@liberfi.io/ui-tokens";
import { formatPrice, SafeBigNumber } from "@liberfi.io/utils";
import {
  getPrimaryTokenAddress,
  getPrimaryTokenDecimals,
  getPrimaryTokenSymbol,
} from "@liberfi/core";
import {
  chainAtom,
  useAppSdk,
  useAuthenticatedCallback,
  useWalletPrimaryTokenBalance,
} from "@liberfi/ui-base";
import { defaultTradePresetValues, useSwap, useTradeBuySettings } from "@liberfi/ui-dex";
import { useMemo } from "react";
import { useInstantBuy } from "./InstantBuyContext";
import { useAtomValue } from "jotai";

export function InstantBuy({ token }: TokenListActionsProps) {
  const chainId = useAtomValue(chainAtom);

  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const { amount, preset } = useInstantBuy();

  const balance = useWalletPrimaryTokenBalance();

  const primaryTokenSymbol = useMemo(() => getPrimaryTokenSymbol(chainId), [chainId]);

  const primaryTokenDecimals = useMemo(() => getPrimaryTokenDecimals(chainId), [chainId]);

  const primaryTokenAddress = useMemo(() => getPrimaryTokenAddress(chainId), [chainId]);

  const buySettings = useTradeBuySettings(chainId);

  const presetSettings = useMemo(
    () => buySettings?.presets?.[preset ?? 0] ?? defaultTradePresetValues,
    [buySettings, preset],
  );

  const { swap, isSwapping } = useSwap();

  const handleInstantBuy = useAuthenticatedCallback(async () => {
    if (!balance?.amount || !primaryTokenAddress || !primaryTokenDecimals || !token.address) return;

    if (!amount || new SafeBigNumber(amount).lte(0.0001)) {
      toast.error(
        t("extend.trade.buy_min_amount", { amount: "0.0001", symbol: primaryTokenSymbol ?? "" }),
      );
      return;
    }

    // balance is insufficient
    if (new SafeBigNumber(balance.amount).lt(amount)) {
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
    amount,
    token.address,
    primaryTokenDecimals,
    primaryTokenAddress,
    swap,
    balance?.amount,
    presetSettings,
  ]);

  return (
    <div className="w-full h-full relative">
      <StyledButton
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
      </StyledButton>
    </div>
  );
}
