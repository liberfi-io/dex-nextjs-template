import { Key, useCallback, useRef, useState } from "react";
import { clsx } from "clsx";
import { Tab, Tabs } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { SwitchWallet } from "../../wallet/SwitchWallet";
import { SwitchPreset } from "./SwitchPreset";
import { MarketBuyForm } from "./MarketBuyForm";
import { MarketSellForm } from "./MarketSellForm";
import { BuyTradeSettingsForm } from "./BuyTradeSettingsForm";
import { SellTradeSettingsForm } from "./SellTradeSettingsForm";

export type InstantTradeProps = {
  className?: string;
};

export function InstantTrade({ className }: InstantTradeProps) {
  const { t } = useTranslation();

  const [tradeDirection, setTradeDirection] = useState<"buy" | "sell">("buy");

  const [tradeType, setTradeType] = useState<"limit" | "market" | "advanced">("market");

  const [showSettingsForm, setShowSettingsForm] = useState(false);

  const lastClickedPreset = useRef<number | null>(null);

  const handleClickPreset = useCallback((preset: number) => {
    const lastClicked = lastClickedPreset.current;
    lastClickedPreset.current = preset;
    setShowSettingsForm((prev) => (lastClicked === null || lastClicked !== preset ? true : !prev));
  }, []);

  return (
    <div className={clsx("flex-none sm:px-3 py-3 bg-content1 rounded-lg", className)}>
      {/* trade direction */}
      <Tabs
        fullWidth
        size="sm"
        selectedKey={tradeDirection}
        onSelectionChange={setTradeDirection as (key: Key) => void}
        classNames={{ tabList: "bg-content2", tab: "data-[selected=true]:bg-content3 h-6" }}
        // TODO heroui bug: tab animation conflicts with modal animation
        disableAnimation
      >
        <Tab key="buy" title={t("extend.trade.buy")} />
        <Tab key="sell" title={t("extend.trade.sell")} />
      </Tabs>

      <div className="mt-2.5 h-8 flex items-center justify-between">
        {/* trade type */}
        <Tabs
          size="sm"
          variant="underlined"
          classNames={{ tabList: "gap-0", tab: "px-1.5" }}
          selectedKey={tradeType}
          onSelectionChange={setTradeType as (key: Key) => void}
          // TODO heroui bug: tab animation conflicts with modal animation
          disableAnimation
        >
          <Tab key="market" title={t("extend.trade.market")} />
          {/* <Tab key="limit" title={t("extend.trade.limit")} />
          <Tab key="advanced" title={t("extend.trade.advanced")} /> */}
        </Tabs>

        {/* multi wallets switch */}
        <SwitchWallet />
      </div>

      {/* trade form */}
      <div className="mt-2.5">
        {tradeDirection === "buy" && tradeType === "market" && <MarketBuyForm />}
        {tradeDirection === "sell" && tradeType === "market" && <MarketSellForm />}
      </div>

      {/* switch preset */}
      <SwitchPreset direction={tradeDirection} className="mt-4" onClick={handleClickPreset} />

      {/* edit trade settings */}
      {showSettingsForm && (
        <div className="mt-2.5">
          {tradeDirection === "buy" && <BuyTradeSettingsForm />}
          {tradeDirection === "sell" && <SellTradeSettingsForm />}
        </div>
      )}
    </div>
  );
}
