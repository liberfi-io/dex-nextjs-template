import { useTokenListContext } from "../TokenListContext";
import { PropsWithChildren, useCallback } from "react";
import { ListSort } from "@/components/ListSort";

export function HoldersSort({ children }: PropsWithChildren) {
  const { sort, setSort } = useTokenListContext();

  const handleSortHolders = useCallback(
    (sort: "asc" | "desc" | undefined) => {
      setSort(sort ? { holders: sort } : {});
    },
    [setSort],
  );

  return (
    <ListSort sort={sort["holders"]} onSort={handleSortHolders}>
      {children}
    </ListSort>
  );
}
