import { useCallback, useEffect, useMemo } from "react";
import { useAtom } from "jotai";
import { clsx } from "clsx";
import { cloneDeep } from "lodash-es";
import { InstantBuyAmountInput } from "../trade";
import { pulseSettingsAtom } from "../../states";
import { usePulseListContext } from "./PulseListContext";
import { PauseIcon } from "@liberfi/ui-base";

export type PulseListHeaderProps = {
  title: string;
  className?: string;
};

export function PulseListHeader({ title, className }: PulseListHeaderProps) {
  const { type, isPaused, setInstantBuyAmount } = usePulseListContext();

  const [pulseSettings, setPulseSettings] = useAtom(pulseSettingsAtom);

  const settings = useMemo(() => pulseSettings[type], [pulseSettings, type]);

  useEffect(
    () => setInstantBuyAmount(settings?.instant_buy?.amount),
    [settings?.instant_buy?.amount, setInstantBuyAmount],
  );

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
    <div
      className={clsx(
        "w-full h-12 px-3 bg-content1 flex items-center justify-between gap-4 border-b border-border",
        className,
      )}
    >
      <h2 className="font-semibold">{title}</h2>
      <div className="flex items-center gap-3">
        {isPaused && <PauseIcon className="w-5 h-5 text-primary" />}
        <InstantBuyAmountInput
          variant="bordered"
          amount={settings?.instant_buy?.amount}
          preset={settings?.instant_buy?.preset}
          onAmountChange={handleInstantBuyAmountChange}
          onPresetChange={handleInstantBuyPresetChange}
        />
      </div>
    </div>
  );
}
