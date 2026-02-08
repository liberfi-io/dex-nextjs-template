import { useTokenListContext } from "../TokenListContext";
import { ListSort } from "@/components/ListSort";
import { PropsWithChildren, useCallback } from "react";

export function TradersSort({ children }: PropsWithChildren) {
  const { sort, setSort } = useTokenListContext();

  const handleSortTraders = useCallback(
    (sort: "asc" | "desc" | undefined) => {
      setSort(sort ? { traders: sort } : {});
    },
    [setSort],
  );

  return (
    <ListSort sort={sort["traders"]} onSort={handleSortTraders}>
      {children}
    </ListSort>
  );
}
