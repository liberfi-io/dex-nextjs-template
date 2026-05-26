import { InstantTrade } from "@liberfi/ui-dex/components/trade";

/**
 * Right-sidebar trading panel. Wraps `InstantTrade` from the dex package so
 * the Buy / Sell form remains a single source of truth. The previously-
 * appended position-stats row (Bought / Sold / Holding / PnL) was removed
 * because it was static placeholder data with no real wiring — once a
 * proper trader-stats source exists it can be re-introduced as its own
 * widget, but until then it just adds visual noise to the sidebar.
 */
export function TradingPanel() {
  return (
    <div className="relative axiom-trade-panel">
      <InstantTrade className="!rounded-none !bg-transparent !py-2 !px-3" />
    </div>
  );
}
