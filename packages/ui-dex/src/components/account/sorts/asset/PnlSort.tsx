import { PropsWithChildren, useCallback } from "react";
import { ListSort } from "../../../ListSort";

export type PnlSortProps = PropsWithChildren<{
  sort: Record<string, "asc" | "desc">;
  onSortChange: (sort: Record<string, "asc" | "desc">) => void;
}>;

export function PnlSort({ children, sort, onSortChange }: PnlSortProps) {
  const handleSortPnl = useCallback(
    (sort: "asc" | "desc" | undefined) => {
      onSortChange(sort ? { pnl: sort } : {});
    },
    [onSortChange],
  );

  return (
    <ListSort sort={sort["pnl"]} onSort={handleSortPnl}>
      {children}
    </ListSort>
  );
}
