import { useEffect } from "react";
import type { Chain } from "@liberfi.io/types";
import { InstantTradeWidget, useInstantTrade } from "@liberfi.io/ui-trade";

export interface TradingPanelProps {
  chain: Chain;
  tokenAddress: string;
  /**
   * Optional initial trade direction. When this panel is rendered inside a
   * mobile bottom-sheet (see {@link MobileTradeBar}) the tapped CTA
   * determines whether the form opens on Buy or Sell. The right-sidebar
   * desktop usage omits this prop and gets the default `"buy"`.
   */
  defaultDirection?: "buy" | "sell";
}

function DirectionSeed({ direction }: { direction?: "buy" | "sell" }) {
  const { setDirection } = useInstantTrade();
  useEffect(() => {
    if (direction) setDirection(direction);
  }, [direction, setDirection]);
  return null;
}

/**
 * Right-sidebar trading panel. Uses the SDK InstantTrade widget; DexClient
 * and Stage 5.1 trade adapter come from application runtime providers.
 */
export function TradingPanel({
  chain,
  tokenAddress,
  defaultDirection,
}: TradingPanelProps) {
  return (
    <div className="relative axiom-trade-panel">
      <InstantTradeWidget
        chain={chain}
        tokenAddress={tokenAddress}
        className="!rounded-none !bg-transparent !py-2 !px-3"
        headerExtra={<DirectionSeed direction={defaultDirection} />}
      />
    </div>
  );
}
