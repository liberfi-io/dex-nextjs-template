import { PropsWithChildren, useCallback } from "react";
import { ListSort } from "../../../ListSort";

export type PnlChangeSortProps = PropsWithChildren<{
  sort: Record<string, "asc" | "desc">;
  onSortChange: (sort: Record<string, "asc" | "desc">) => void;
}>;

export function PnlChangeSort({ children, sort, onSortChange }: PnlChangeSortProps) {
  const handleSortPnlChange = useCallback(
    (sort: "asc" | "desc" | undefined) => {
      onSortChange(sort ? { pnl_change: sort } : {});
    },
    [onSortChange],
  );

  return (
    <ListSort sort={sort["pnl_change"]} onSort={handleSortPnlChange}>
      {children}
    </ListSort>
  );
}
