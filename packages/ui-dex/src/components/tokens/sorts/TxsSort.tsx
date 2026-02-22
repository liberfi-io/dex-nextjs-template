import { useTokenListContext } from "../TokenListContext";
import { ListSort } from "../../ListSort";
import { PropsWithChildren, useCallback } from "react";

export function TxsSort({ children }: PropsWithChildren) {
  const { sort, setSort } = useTokenListContext();

  const handleSortTxs = useCallback(
    (sort: "asc" | "desc" | undefined) => {
      setSort(sort ? { txs: sort } : {});
    },
    [setSort],
  );

  return (
    <ListSort sort={sort["txs"]} onSort={handleSortTxs}>
      {children}
    </ListSort>
  );
}
