import { Key, useCallback, useState } from "react";
import { Tab, Tabs } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { BuySettingsValues, SellSettingsValues, TradeSettingsValues } from "@/types";
import { BuySettingsForm } from "./BuySettingsForm";
import { SellSettingsForm } from "./SellSettingsForm";

export type TradeSettingsProps = {
  onSettings?: (settings: Partial<TradeSettingsValues>) => void;
  type?: "buy" | "sell";
  preset?: number;
};

export function TradeSettings({ onSettings, type, preset }: TradeSettingsProps) {
  const { t } = useTranslation();

  const [settingsType, setSettingsType] = useState<"buy" | "sell">(type ?? "buy");

  const handleBuySettings = useCallback(
    (buySettings: BuySettingsValues) => onSettings?.({ buy: buySettings }),
    [onSettings],
  );

  const handleSellSettings = useCallback(
    (sellSettings: SellSettingsValues) => onSettings?.({ sell: sellSettings }),
    [onSettings],
  );

  return (
    <div className="space-y-4 pb-4">
      <Tabs
        fullWidth
        selectedKey={settingsType}
        onSelectionChange={setSettingsType as (key: Key) => void}
        classNames={{ tabList: "bg-content2", tab: "data-[selected=true]:bg-content3" }}
        // TODO heroui bug: tab animation conflicts with modal animation
        disableAnimation
      >
        <Tab key="buy" title={t("extend.trade.settings.buy_settings")} />
        <Tab key="sell" title={t("extend.trade.settings.sell_settings")} />
      </Tabs>

      {settingsType === "buy" && <BuySettingsForm onSettings={handleBuySettings} preset={preset} />}
      {settingsType === "sell" && (
        <SellSettingsForm onSettings={handleSellSettings} preset={preset} />
      )}
    </div>
  );
}
