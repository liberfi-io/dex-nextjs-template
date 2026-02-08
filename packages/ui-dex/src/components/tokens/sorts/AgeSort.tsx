import { ListSort } from "@/components/ListSort";
import { useTokenListContext } from "../TokenListContext";
import { PropsWithChildren, useCallback } from "react";

export function AgeSort({ children }: PropsWithChildren) {
  const { sort, setSort } = useTokenListContext();

  const handleSortAge = useCallback(
    (sort: "asc" | "desc" | undefined) => {
      setSort(sort ? { age: sort } : {});
    },
    [setSort],
  );

  return (
    <ListSort sort={sort["age"]} onSort={handleSortAge}>
      {children}
    </ListSort>
  );
}
