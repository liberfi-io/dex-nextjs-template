import { SortAscIcon, SortDescIcon } from "@/assets/icons";
import clsx from "clsx";
import { PropsWithChildren, useCallback } from "react";

export type ListSortProps = PropsWithChildren<{
  preferredSort?: "asc" | "desc";
  sort?: "asc" | "desc";
  onSort?: (sort: "asc" | "desc" | undefined) => void;
}>;

export function ListSort({ children, sort, preferredSort = "desc", onSort }: ListSortProps) {
  const handleSort = useCallback(() => {
    if (sort === undefined) {
      onSort?.(preferredSort);
    } else if (sort === preferredSort) {
      onSort?.(preferredSort === "asc" ? "desc" : "asc");
    } else {
      onSort?.(undefined);
    }
  }, [sort, preferredSort, onSort]);

  return (
    <div className="flex items-center cursor-pointer select-none" onClick={handleSort}>
      {/* highlight the text when the sort is active */}
      <span className={clsx(sort !== undefined && "text-foreground")}>{children}</span>
      <div className="ml-1 h-fit flex items-center justify-center">
        <div className="flex flex-col justify-around">
          {/* highlight the icon when the sort is active */}
          <div className={clsx(sort === "asc" && "text-bullish")}>
            <SortAscIcon />
          </div>
          {/* highlight the icon when the sort is active */}
          <div className={clsx(sort === "desc" && "text-bullish", "mt-px")}>
            <SortDescIcon />
          </div>
        </div>
      </div>
    </div>
  );
}
