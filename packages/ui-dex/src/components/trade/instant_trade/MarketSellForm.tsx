import { useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { BigNumber } from "bignumber.js";
import { Button } from "@heroui/react";
import {
  formatPriceUSD,
  getPrimaryTokenAddress,
  getPrimaryTokenDecimals,
  getPrimaryTokenSymbol,
  SOL_TOKEN_DECIMALS,
  SOL_TOKEN_SYMBOL,
} from "@liberfi/core";
import {
  chainAtom,
  useAuthenticatedCallback,
  useTranslation,
  useWalletTokenBalance,
} from "@liberfi/ui-base";
import { tokenInfoAtom, tokenLatestPriceAtom, tradeSellPresetAtom, useQuotePrice } from "@/states";
import { useSwap, useTradeSellSettings } from "@/hooks";
import { defaultTradePresetValues } from "@/types";
import { SellAmountInput } from "./SellAmountInput";
import { SellTokenAmount } from "./SellTokenAmount";
import { SellTokenBalance } from "./SellTokenBalance";
import { SellPreset } from "./SellPreset";

export function MarketSellForm() {
  const { t } = useTranslation();

  // sell amount
  const [amount, setAmount] = useState<number | undefined>();

  const chain = useAtomValue(chainAtom);

  // primary token symbol
  const primaryTokenSymbol =
    useMemo(() => getPrimaryTokenSymbol(chain), [chain]) ?? SOL_TOKEN_SYMBOL;

  // primary token address
  const primaryTokenAddress = useMemo(() => getPrimaryTokenAddress(chain), [chain]);

  // primary token decimals
  const primaryTokenDecimals =
    useMemo(() => getPrimaryTokenDecimals(chain), [chain]) ?? SOL_TOKEN_DECIMALS;

  // primary token price in usd
  const primaryTokenPrice = useQuotePrice(primaryTokenSymbol);

  // sell token info
  const tokenInfo = useAtomValue(tokenInfoAtom);

  // sell token balance
  const tokenBalance = useWalletTokenBalance(tokenInfo?.address ?? "");

  // sell token price in usd
  const tokenPrice = useAtomValue(tokenLatestPriceAtom);

  // sell settings
  const settings = useTradeSellSettings(chain);

  //  sell preset
  const preset = useAtomValue(tradeSellPresetAtom);

  // sell preset settings
  const presetSettings = useMemo(
    () => settings?.presets?.[preset] ?? defaultTradePresetValues,
    [preset, settings],
  );

  // disabled if amount or balance is not set, or balance is insufficient
  const disabled = useMemo(
    () => !amount || !tokenBalance?.amount || new BigNumber(tokenBalance.amount).lt(amount),
    [amount, tokenBalance],
  );

  const submitText = useMemo(() => {
    // amount or balance is not set
    if (!amount || !tokenBalance?.amount) return t("extend.trade.sell");
    // prices is not set
    if (!tokenPrice || !primaryTokenPrice) return t("extend.trade.sell");
    // display the amount in usd
    const amountInUsd = new BigNumber(tokenPrice).times(amount);
    const amountInUsdFormatted = formatPriceUSD(amountInUsd);
    const primaryTokenAmount = amountInUsd.div(primaryTokenPrice);
    const primaryTokenAmountFormatted = new BigNumber(primaryTokenAmount)
      .decimalPlaces(primaryTokenDecimals)
      .toString();
    return `${t(
      "extend.trade.sell",
    )} ${primaryTokenAmountFormatted} ${primaryTokenSymbol} (${amountInUsdFormatted})`;
  }, [
    t,
    amount,
    tokenBalance,
    tokenPrice,
    primaryTokenPrice,
    primaryTokenSymbol,
    primaryTokenDecimals,
  ]);

  const { swap, isSwapping } = useSwap();

  const handleSubmit = useAuthenticatedCallback(async () => {
    if (
      !amount ||
      !tokenInfo ||
      !tokenBalance?.amount ||
      !primaryTokenAddress ||
      !primaryTokenDecimals
    )
      return;

    // balance is insufficient
    if (new BigNumber(tokenBalance.amount).lt(amount)) {
      return;
    }

    const tokenDecimals = tokenInfo.decimals;

    const amountInDecimals = new BigNumber(amount)
      .shiftedBy(tokenDecimals)
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

    const submitted = await swap({
      from: tokenInfo.address,
      to: primaryTokenAddress,
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
    amount,
    tokenInfo,
    tokenBalance,
    primaryTokenAddress,
    primaryTokenDecimals,
    presetSettings,
    swap,
  ]);

  return (
    <>
      <SellTokenAmount amount={amount} className="mt-2 hidden" />
      <SellAmountInput value={amount} onChange={setAmount} className="mt-2" />
      <SellTokenBalance className="mt-2" />
      <SellPreset className="mt-4" />
      <Button
        fullWidth
        size="sm"
        color="secondary"
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
