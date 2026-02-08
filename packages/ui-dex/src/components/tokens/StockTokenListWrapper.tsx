import { StockTokenList } from "./StockTokenList";
import { StockTokenListHeaders } from "./StockTokenListHeaders";

export function StockTokenListWrapper() {
  return (
    <div className="w-full rounded-lg px-0 lg:px-4 bg-transparent lg:bg-content1">
      <StockTokenListHeaders />
      <StockTokenList />
    </div>
  );
}
