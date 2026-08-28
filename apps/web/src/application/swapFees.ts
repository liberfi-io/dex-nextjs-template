import { SafeBigNumber } from "@liberfi.io/utils";

export const INSTANT_TRADE_AMOUNT_ID = "token-list";

type PresetFees = {
  slippage: number | null;
  priorityFee: number | null;
  tipFee: number | null;
  antiMev: "off" | "reduced" | "secure" | boolean;
};

export function swapFeesFromPreset(preset: PresetFees, decimals: number) {
  const shift = (value: number | null) =>
    new SafeBigNumber(value ?? 0).shiftedBy(decimals).decimalPlaces(0).toString();

  return {
    slippage: preset.slippage ?? 20,
    priorityFee: shift(preset.priorityFee),
    tipFee: shift(preset.tipFee),
    isAntiMev: preset.antiMev !== "off" && preset.antiMev !== false,
  };
}
