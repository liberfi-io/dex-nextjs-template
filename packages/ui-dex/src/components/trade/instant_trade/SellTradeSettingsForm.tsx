import { useCallback, useMemo } from "react";
import { useAtomValue } from "jotai";
import { chainAtom } from "@liberfi/ui-base";
import { tradeSellPresetAtom } from "@/states";
import { useSaveTradeSellSettings, useTradeSellSettings } from "@/hooks";
import { defaultSellSettingsValues, defaultTradePresetValues, TradePresetValues } from "@/types";
import { PresetForm } from "./PresetForm";

export type SellTradeSettingsFormProps = {
  className?: string;
};

export function SellTradeSettingsForm({ className }: SellTradeSettingsFormProps) {
  const chain = useAtomValue(chainAtom);

  const preset = useAtomValue(tradeSellPresetAtom);

  const settings = useTradeSellSettings(chain);

  const save = useSaveTradeSellSettings(chain);

  const presetValues = useMemo(
    () => settings?.presets?.[preset] ?? defaultTradePresetValues,
    [preset, settings],
  );

  const handlePresetChange = useCallback(
    (value: TradePresetValues) => {
      const prevSettings = settings ?? defaultSellSettingsValues;
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
      // reset form when preset changed
      key={`sell-${preset}`}
      className={className}
      value={presetValues}
      onChange={handlePresetChange}
    />
  );
}
