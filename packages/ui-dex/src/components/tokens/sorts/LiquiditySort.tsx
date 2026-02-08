import { useTokenListContext } from "../TokenListContext";
import { ListSort } from "@/components/ListSort";
import { PropsWithChildren, useCallback } from "react";

export type LiquiditySortProps = {
  className?: string;
};

export function LiquiditySort({ children }: PropsWithChildren) {
  const { sort, setSort } = useTokenListContext();

  const handleSortLiquidity = useCallback(
    (sort: "asc" | "desc" | undefined) => {
      setSort(sort ? { liquidity: sort } : {});
    },
    [setSort],
  );

  return (
    <ListSort sort={sort["liquidity"]} onSort={handleSortLiquidity}>
      {children}
    </ListSort>
  );
}
