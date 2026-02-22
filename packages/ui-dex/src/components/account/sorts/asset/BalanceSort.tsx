import { PropsWithChildren, useCallback } from "react";
import { ListSort } from "../../../ListSort";

export type BalanceSortProps = PropsWithChildren<{
  sort: Record<string, "asc" | "desc">;
  onSortChange: (sort: Record<string, "asc" | "desc">) => void;
}>;

export function BalanceSort({ children, sort, onSortChange }: BalanceSortProps) {
  const handleSortBalance = useCallback(
    (sort: "asc" | "desc" | undefined) => {
      onSortChange(sort ? { balance: sort } : {});
    },
    [onSortChange],
  );

  return (
    <ListSort sort={sort["balance"]} onSort={handleSortBalance}>
      {children}
    </ListSort>
  );
}
