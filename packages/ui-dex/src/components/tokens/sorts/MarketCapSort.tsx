import { useTokenListContext } from "../TokenListContext";
import { PropsWithChildren, useCallback } from "react";
import { ListSort } from "../../ListSort";

export function MarketCapSort({ children }: PropsWithChildren) {
  const { sort, setSort } = useTokenListContext();

  const handleSortMarketCap = useCallback(
    (sort: "asc" | "desc" | undefined) => {
      setSort(sort ? { market_cap: sort } : {});
    },
    [setSort],
  );

  return (
    <ListSort sort={sort["market_cap"]} onSort={handleSortMarketCap}>
      {children}
    </ListSort>
  );
}
