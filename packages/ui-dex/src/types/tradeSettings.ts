/**
 * Trade settings types
 */
import { z } from "zod";
import { Chain } from "@liberfi/core";

export const TradePresetSchema = z.object({
  slippage: z.number().min(0).max(100).nullable(),
  priorityFee: z.number().min(0).nullable(),
  tipFee: z.number().min(0).nullable(),
  autoFee: z.boolean(),
  maxAutoFee: z.number().min(0).nullable(),
  antiMev: z.union([z.literal("off"), z.literal("reduced"), z.literal("secure"), z.boolean()]),
  customRPC: z.string().url("trade.settings.custom_rpc_error").nullable(),
});

export type TradePresetValues = z.infer<typeof TradePresetSchema>;

export const defaultTradePresetValues: TradePresetValues = {
  slippage: 20,
  priorityFee: 0.001,
  tipFee: 0.001,
  autoFee: false,
  maxAutoFee: 0.1,
  antiMev: "off",
  customRPC: null,
};

export const BuySettingsSchema = z.object({
  customAmounts: z.array(z.number().gt(0).nullable()).length(4),
  presets: z.array(TradePresetSchema).length(3),
});

export type BuySettingsValues = z.infer<typeof BuySettingsSchema>;

export const defaultCustomBuyAmounts: number[] = [0.01, 0.1, 1, 10];

export const defaultBuySettingsValues: BuySettingsValues = {
  customAmounts: [...defaultCustomBuyAmounts],
  presets: [
    { ...defaultTradePresetValues },
    { ...defaultTradePresetValues },
    { ...defaultTradePresetValues },
  ],
};

export const SellSettingsSchema = z.object({
  customPercentages: z.array(z.number().gt(0).nullable()).length(4),
  presets: z.array(TradePresetSchema).length(3),
});

export type SellSettingsValues = z.infer<typeof SellSettingsSchema>;

export const defaultCustomSellPercentages: number[] = [10, 25, 50, 100];

export const defaultSellSettingsValues: SellSettingsValues = {
  customPercentages: [...defaultCustomSellPercentages],
  presets: [
    { ...defaultTradePresetValues },
    { ...defaultTradePresetValues },
    { ...defaultTradePresetValues },
  ],
};

export type TradeSettingsValues = {
  buy: BuySettingsValues;
  sell: SellSettingsValues;
};

export type TradeSettingsValuesByChain = Partial<Record<Chain, TradeSettingsValues>>;
