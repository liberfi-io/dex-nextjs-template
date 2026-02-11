import { useMemo, useState } from "react";
import { BigNumber } from "bignumber.js";
import { useAtomValue } from "jotai";
import { Button } from "@heroui/react";
import { formatAmountUSD, getPrimaryTokenAddress, getPrimaryTokenDecimals } from "@liberfi/core";
import {
  chainAtom,
  useAppSdk,
  useAuthenticatedCallback,
  useTranslation,
  useWalletPrimaryTokenNetWorth,
} from "@liberfi/ui-base";
import { tokenAddressAtom, tradeBuyPresetAtom, useQuotePrice } from "@/states";
import { useSwap, useTradeBuySettings } from "@/hooks";
import { defaultTradePresetValues } from "@/types";
import { BuyAmountInput } from "./BuyAmountInput";
import { BuyPreset } from "./BuyPreset";
import { BuyTokenBalance } from "./BuyTokenBalance";
import { BuyTokenAmount } from "./BuyTokenAmount";

export function MarketBuyForm() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const chain = useAtomValue(chainAtom);

  // buy amount
  const [amount, setAmount] = useState<number | undefined>();

  // primary token balance
  const balance = useWalletPrimaryTokenNetWorth();

  // primary token address
  const primaryTokenAddress = useMemo(() => getPrimaryTokenAddress(chain), [chain]);

  // primary token decimals
  const primaryTokenDecimals = useMemo(() => getPrimaryTokenDecimals(chain), [chain]);

  // primary token price in usd
  const primaryTokenPrice = useQuotePrice(balance?.symbol ?? "");

  // buy token address
  const tokenAddress = useAtomValue(tokenAddressAtom);

  // buy settings
  const settings = useTradeBuySettings(chain);

  // buy preset
  const preset = useAtomValue(tradeBuyPresetAtom);

  // buy preset settings
  const presetSettings = useMemo(
    () => settings?.presets?.[preset] ?? defaultTradePresetValues,
    [preset, settings],
  );

  // disabled if amount or balance is not set
  const disabled = useMemo(() => !amount || !balance?.amount, [amount, balance]);

  const submitText = useMemo(() => {
    // amount or balance is not set
    if (!amount || !balance?.amount) return t("extend.trade.buy");
    // balance is insufficient
    if (new BigNumber(balance.amount).lt(amount)) return t("extend.trade.buy_insufficient_balance");
    // without the primary token price, just display the amount
    if (!primaryTokenPrice) return `${t("extend.trade.buy")} ${amount} ${balance.symbol}`;
    // with the primary token price, display the amount in usd
    const amountInUsd = formatAmountUSD(new BigNumber(amount).times(primaryTokenPrice));
    return `${t("extend.trade.buy")} ${amount} ${balance.symbol} (${amountInUsd})`;
  }, [t, amount, balance, primaryTokenPrice]);

  const { swap, isSwapping } = useSwap();

  const handleSubmit = useAuthenticatedCallback(async () => {
    if (
      !amount ||
      !balance?.amount ||
      !primaryTokenAddress ||
      !primaryTokenDecimals ||
      !tokenAddress
    )
      return;

    // balance is insufficient
    if (new BigNumber(balance.amount).lt(amount)) {
      appSdk.events.emit("deposit:open");
      return;
    }

    const amountInDecimals = new BigNumber(amount).shiftedBy(primaryTokenDecimals).decimalPlaces(0).toString();

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

    const submitted = await swap({
      from: primaryTokenAddress,
      to: tokenAddress,
      amount: amountInDecimals,
      slippage: presetSettings.slippage ?? defaultTradePresetValues.slippage!,
      priorityFee: priorityFeeInDecimals,
      tipFee: tipFeeInDecimals,
      isAntiMev: presetSettings.antiMev,
    });

    // reset input if the transaction is submitted successfully
    if (submitted) {
      setAmount(undefined);
    }
  }, [
    appSdk,
    amount,
    balance,
    primaryTokenAddress,
    primaryTokenDecimals,
    presetSettings,
    tokenAddress,
    swap,
  ]);

  return (
    <>
      <BuyTokenBalance className="mt-2 hidden" />
      <BuyAmountInput value={amount} onChange={setAmount} className="mt-2" />
      <BuyTokenAmount amount={amount} className="mt-2" />
      <BuyPreset className="mt-4" />
      <Button
        fullWidth
        size="sm"
        color="primary"
        className="mt-2 rounded-lg"
        disableRipple
        isDisabled={disabled}
        isLoading={isSwapping}
        onPress={handleSubmit}
      >
        {submitText}
      </Button>
    </>
  );
}
