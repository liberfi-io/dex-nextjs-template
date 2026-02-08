import { TradeTokenBasicInfo } from "./TradeTokenBasicInfo";
import { TradeTokenMarketInfo } from "./TradeTokenMarketInfo";

export function TradeTokenBasic() {
  return (
    <div className="flex-none w-full h-12 hidden md:flex gap-1 rounded-lg overflow-hidden">
      <TradeTokenBasicInfo />
      <TradeTokenMarketInfo />
    </div>
  );
}
