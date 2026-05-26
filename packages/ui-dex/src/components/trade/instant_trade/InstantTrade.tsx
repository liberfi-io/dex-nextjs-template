import { Key, useCallback, useRef, useState } from "react";
import { clsx } from "clsx";
import { Tab, Tabs } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { BuyTokenBalance } from "./BuyTokenBalance";
import { SellTokenBalance } from "./SellTokenBalance";
import { SwitchPreset } from "./SwitchPreset";
import { MarketBuyForm } from "./MarketBuyForm";
import { MarketSellForm } from "./MarketSellForm";
import { BuyTradeSettingsForm } from "./BuyTradeSettingsForm";
import { SellTradeSettingsForm } from "./SellTradeSettingsForm";

export type InstantTradeProps = {
  className?: string;
  /**
   * Initial trade direction. Defaults to `"buy"`. The mobile trade-bar
   * sheet uses this so that tapping the red "Sell" CTA opens the panel
   * already on the Sell tab instead of forcing a second tap. Once
   * mounted, the user can still switch directions via the in-panel
   * tablist — `defaultDirection` only seeds the initial state.
   */
  defaultDirection?: "buy" | "sell";
};

/**
 * Right-sidebar instant-trade widget.
 *
 * Visual treatment is mostly driven by the `.axiom-trade-panel` overrides
 * in `globals.css` — those rules use attribute selectors against HeroUI's
 * data slots (e.g. `[role="tablist"][class*="bg-content2"]`) so that
 * height, padding, and the per-direction selected colours stay consistent
 * even when HeroUI bumps its internal variant classes. Keeping the
 * `bg-content2`-marked classes on the buy/sell `<Tabs>` is therefore part
 * of the contract with that stylesheet; do not remove or rename them
 * without updating `globals.css` in lockstep.
 */
export function InstantTrade({
  className,
  defaultDirection = "buy",
}: InstantTradeProps) {
  const { t } = useTranslation();

  const [tradeDirection, setTradeDirection] = useState<"buy" | "sell">(
    defaultDirection,
  );

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
      {/* Trade direction — height / colour / weight are all driven from
          globals.css (.axiom-trade-panel selectors). `bg-content2` is the
          marker class those selectors key off; `cursor: hidden` suppresses
          the floating selection pill so our per-tab tinted bg shows
          through. */}
      <Tabs
        fullWidth
        size="sm"
        selectedKey={tradeDirection}
        onSelectionChange={setTradeDirection as (key: Key) => void}
        classNames={{
          tabList: "bg-content2",
          cursor: "hidden",
        }}
        // TODO heroui bug: tab animation conflicts with modal animation
        disableAnimation
      >
        <Tab key="buy" title={t("extend.trade.buy")} />
        <Tab key="sell" title={t("extend.trade.sell")} />
      </Tabs>

      <div className="mt-2 h-6 flex items-center justify-between">
        {/* Trade type — slim underline tab; `rounded-none` keys into the
            globals.css override block. */}
        <Tabs
          size="sm"
          variant="underlined"
          classNames={{ tabList: "gap-0 rounded-none", tab: "px-1.5" }}
          selectedKey={tradeType}
          onSelectionChange={setTradeType as (key: Key) => void}
          // TODO heroui bug: tab animation conflicts with modal animation
          disableAnimation
        >
          <Tab key="market" title={t("extend.trade.market")} />
          {/* <Tab key="limit" title={t("extend.trade.limit")} />
          <Tab key="advanced" title={t("extend.trade.advanced")} /> */}
        </Tabs>

        {/* Balance — replaced the pill-shaped wallet selector with plain
            small-text "Balance: <amount> <symbol>". The full wallet selector
            still lives in the top nav and other launch surfaces; inside the
            trade panel it was visually heavy and redundant. */}
        {tradeDirection === "buy" ? <BuyTokenBalance /> : <SellTokenBalance />}
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
