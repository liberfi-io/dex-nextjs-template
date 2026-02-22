import { useCallback, useMemo, useState } from "react";
import { clsx } from "clsx";
import { useAtomValue } from "jotai";
import { Button } from "@heroui/react";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { ChevronDownIcon } from "@liberfi/ui-base";
import { useSaveTradeSellSettings, useTradeSellSettings } from "../../../hooks";
import { tradeSellPresetAtom } from "../../../states";
import { defaultSellSettingsValues, defaultTradePresetValues, TradePresetValues } from "../../../types";
import { PresetOverview } from "./PresetOverview";
import { PresetForm } from "./PresetForm";

export type SellPresetProps = {
  className?: string;
};

export function SellPreset({ className }: SellPresetProps) {
  const { chain } = useCurrentChain();

  const preset = useAtomValue(tradeSellPresetAtom);

  const settings = useTradeSellSettings(chain);

  const save = useSaveTradeSellSettings(chain);

  const presetValues = useMemo(
    () => settings?.presets?.[preset] ?? defaultTradePresetValues,
    [preset, settings],
  );

  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOpen = () => setIsOpen((prev) => !prev);

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
    <div className={className}>
      <div className="flex items-center justify-between">
        <PresetOverview preset={presetValues} />

        <Button
          isIconOnly
          size="sm"
          className="bg-transparent justify-end p-0 h-4 min-h-0 hidden"
          disableRipple
          onPress={handleToggleOpen}
        >
          <ChevronDownIcon
            width={16}
            height={16}
            className={clsx("text-neutral transition-transform", { "-rotate-180": isOpen })}
          />
        </Button>
      </div>

      {isOpen && (
        <PresetForm
          // reset form when preset changed
          key={`sell-${preset}`}
          className="mt-1.5"
          value={presetValues}
          onChange={handlePresetChange}
        />
      )}
    </div>
  );
}
