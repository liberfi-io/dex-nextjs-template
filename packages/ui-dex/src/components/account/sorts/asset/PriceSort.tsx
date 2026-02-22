import { PropsWithChildren, useCallback } from "react";
import { ListSort } from "../../../ListSort";

export type PriceSortProps = PropsWithChildren<{
  sort: Record<string, "asc" | "desc">;
  onSortChange: (sort: Record<string, "asc" | "desc">) => void;
}>;

export function PriceSort({ children, sort, onSortChange }: PriceSortProps) {
  const handleSortPrice = useCallback(
    (sort: "asc" | "desc" | undefined) => {
      onSortChange(sort ? { price: sort } : {});
    },
    [onSortChange],
  );

  return (
    <ListSort sort={sort["price"]} onSort={handleSortPrice}>
      {children}
    </ListSort>
  );
}
