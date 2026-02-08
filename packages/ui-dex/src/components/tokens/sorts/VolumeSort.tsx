import { useTokenListContext } from "../TokenListContext";
import { ListSort } from "@/components/ListSort";
import { PropsWithChildren, useCallback } from "react";

export function VolumeSort({ children }: PropsWithChildren) {
  const { sort, setSort } = useTokenListContext();

  const handleSortVolume = useCallback(
    (sort: "asc" | "desc" | undefined) => {
      setSort(sort ? { volume: sort } : {});
    },
    [setSort],
  );

  return (
    <ListSort sort={sort["volume"]} onSort={handleSortVolume}>
      {children}
    </ListSort>
  );
}
