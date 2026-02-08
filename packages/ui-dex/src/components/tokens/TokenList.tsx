import { useResizeObserver } from "@liberfi/ui-base";
import { DiscoverTokenList2 } from "./DiscoverTokenList2";
import { FavoriteTokenList } from "./FavoriteTokenList";
import { StockTokenList2 } from "./StockTokenList2";
import { useTokenListContext } from "./TokenListContext";
import { ViewListTokenList } from "./ViewListTokenList";
import { useRef } from "react";

export function TokenList() {
  const { type } = useTokenListContext();

   const ref = useRef<HTMLDivElement>(null);

   const { height } = useResizeObserver<HTMLDivElement>({ ref });

  return (
    <div className="w-full flex-auto min-h-0" ref={ref}>
      {type === "favorite" && <FavoriteTokenList />}
      {type === "discover" && <DiscoverTokenList2 height={height} />}
      {type === "views" && <ViewListTokenList />}
      {type === "stocks" && <StockTokenList2 height={height} />}
    </div>
  );
}
