import { useCallback, useMemo } from "react";
import { useAtom } from "jotai";
import { cloneDeep } from "lodash-es";
import { pulseSettingsAtom } from "@/states";
import { InstantBuyAmountInput } from "../trade";
import { usePulseContext } from "./PulseContext";

export function PulseHeaderInstantBuyAmount() {
  const { type } = usePulseContext();

  const [pulseSettings, setPulseSettings] = useAtom(pulseSettingsAtom);

  const settings = useMemo(() => pulseSettings[type], [pulseSettings, type]);

  const handleInstantBuyAmountChange = useCallback(
    (amount?: number) =>
      setPulseSettings((prev) => {
        const next = cloneDeep(prev);
        const settings = next[type] ?? {};
        const instantBuySettings = settings.instant_buy ?? {};
        instantBuySettings.amount = amount;
        settings.instant_buy = instantBuySettings;
        next[type] = settings;
        return next;
      }),
    [type, setPulseSettings],
  );

  const handleInstantBuyPresetChange = useCallback(
    (preset: number) =>
      setPulseSettings((p) => {
        const next = cloneDeep(p);
        const settings = next[type] ?? {};
        const instantBuySettings = settings.instant_buy ?? {};
        instantBuySettings.preset = preset;
        settings.instant_buy = instantBuySettings;
        next[type] = settings;
        return next;
      }),
    [type, setPulseSettings],
  );

  return (
    <InstantBuyAmountInput
      radius="lg"
      size="lg"
      fullWidth
      amount={settings?.instant_buy?.amount}
      preset={settings?.instant_buy?.preset}
      onAmountChange={handleInstantBuyAmountChange}
      onPresetChange={handleInstantBuyPresetChange}
      className="lg:hidden"
    />
  );
}
