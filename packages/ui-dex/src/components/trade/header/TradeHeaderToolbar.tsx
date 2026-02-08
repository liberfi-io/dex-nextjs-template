import { OpenWalletAction } from "./OpenWalletAction";
import { TradeTokenTabs } from "./TradeTokenTabs";

export function TradeHeaderToolbar() {
  return (
    <div className="flex-none w-full h-9 mb-1 max-md:hidden flex">
      {/* token tabs */}
      <div className="flex-1 h-full bg-content1 rounded-lg overflow-hidden">
        <TradeTokenTabs />
      </div>

      {/* open wallet */}
      <OpenWalletAction className="flex-none ml-1 lg:hidden" />
    </div>
  );
}
