import { useCallback, useMemo } from "react";
import { useAtomValue } from "jotai";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { tradeBuyPresetAtom } from "../../../states";
import { defaultBuySettingsValues, defaultTradePresetValues, TradePresetValues } from "../../../types";
import { useSaveTradeBuySettings, useTradeBuySettings } from "../../../hooks";
import { PresetForm } from "./PresetForm";

export type BuyTradeSettingsFormProps = {
  className?: string;
};

export function BuyTradeSettingsForm({ className }: BuyTradeSettingsFormProps) {
  const { chain } = useCurrentChain();

  const preset = useAtomValue(tradeBuyPresetAtom);

  const settings = useTradeBuySettings(chain);

  const save = useSaveTradeBuySettings(chain);

  const presetValues = useMemo(
    () => settings?.presets?.[preset] ?? defaultTradePresetValues,
    [preset, settings],
  );

  const handlePresetChange = useCallback(
    (value: TradePresetValues) => {
      const prevSettings = settings ?? defaultBuySettingsValues;
      const presets = [...prevSettings.presets];
      presets[preset] = value;
      save({
        ...prevSettings,
        presets,
      });
    },
    [save, settings, preset],
  );
  return (
    <PresetForm
      className={className}
      // reset form when preset changed
      key={`buy-${preset}`}
      value={presetValues}
      onChange={handlePresetChange}
    />
  );
}
