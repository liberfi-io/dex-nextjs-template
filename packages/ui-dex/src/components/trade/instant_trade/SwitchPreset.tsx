import { Key, useCallback } from "react";
import { useAtom } from "jotai";
import { Tab, Tabs } from "@heroui/react";
import { tradeBuyPresetAtom, tradeSellPresetAtom } from "../../../states";
import { useTranslation } from "@liberfi/ui-base";

export type SwitchPresetProps = {
  direction: "buy" | "sell";
  className?: string;
  onClick?: (preset: number) => void;
};

export function SwitchPreset({ direction, onClick, className }: SwitchPresetProps) {
  const { t } = useTranslation();

  const [preset, setPreset] = useAtom(
    direction === "buy" ? tradeBuyPresetAtom : tradeSellPresetAtom,
  );

  const handlePresetChange = useCallback((key: Key) => setPreset(Number(key)), [setPreset]);

  return (
    <Tabs
      variant="bordered"
      size="sm"
      fullWidth
      className={className}
      classNames={{
        tabList: "border-content3 border-1 gap-0 p-0.5",
        tab: "min-h-0 h-6 px-2 py-1 text-xs data-[selected=true]:bg-content3",
        tabContent: "text-neutral",
      }}
      selectedKey={`${preset}`}
      onSelectionChange={handlePresetChange}
      // TODO heroui bug: tab animation conflicts with modal animation
      disableAnimation
      aria-label="Presets"
    >
      <Tab key={0} title={t("extend.trade.settings.preset1")} onClick={() => onClick?.(0)} />
      <Tab key={1} title={t("extend.trade.settings.preset2")} onClick={() => onClick?.(1)} />
      <Tab key={2} title={t("extend.trade.settings.preset3")} onClick={() => onClick?.(2)} />
    </Tabs>
  );
}
