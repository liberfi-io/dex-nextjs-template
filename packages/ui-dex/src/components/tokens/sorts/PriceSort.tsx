import { useTokenListContext } from "../TokenListContext";
import { PropsWithChildren, useCallback } from "react";
import { ListSort } from "@/components/ListSort";

export function PriceSort({ children }: PropsWithChildren) {
  const { sort, setSort } = useTokenListContext();

  const handleSortPrice = useCallback(
    (sort: "asc" | "desc" | undefined) => {
      setSort(sort ? { price: sort } : {});
    },
    [setSort],
  );

  return (
    <ListSort sort={sort["price"]} onSort={handleSortPrice}>
      {children}
    </ListSort>
  );
}
