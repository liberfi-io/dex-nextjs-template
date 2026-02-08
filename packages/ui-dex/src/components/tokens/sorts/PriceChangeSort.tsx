import { useTokenListContext } from "../TokenListContext";
import { PropsWithChildren, useCallback } from "react";
import { ListSort } from "@/components/ListSort";

export function PriceChangeSort({ children }: PropsWithChildren) {
  const { sort, setSort } = useTokenListContext();

  const handleSortPriceChange = useCallback(
    (sort: "asc" | "desc" | undefined) => {
      setSort(sort ? { price_change: sort } : {});
    },
    [setSort],
  );

  return (
    <ListSort sort={sort["price_change"]} onSort={handleSortPriceChange}>
      {children}
    </ListSort>
  );
}
