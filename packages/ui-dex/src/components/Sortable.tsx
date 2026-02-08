import { MouseEvent, PropsWithChildren, useCallback } from "react";
import { clsx } from "clsx";
import { TriangleDownIcon, TriangleUpIcon } from "@liberfi/ui-base";

export type SortableProps = PropsWithChildren<{
  /** current sort direction */
  sort?: "asc" | "desc";
  /** callback function when sort direction changes */
  onSortChange?: (sort?: "asc" | "desc") => void | Promise<void>;
}>;

export function Sortable({ sort, onSortChange, children }: SortableProps) {
  const handleSort = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (sort === undefined) {
        onSortChange?.("desc");
      } else if (sort === "desc") {
        onSortChange?.("asc");
      } else {
        onSortChange?.(undefined);
      }
    },
    [sort, onSortChange],
  );

  return (
    <div className="flex items-center gap-1 cursor-pointer" onClick={handleSort}>
      {children}
      <div className="flex flex-col items-center justify-center">
        <TriangleUpIcon width={8} height={8} className={clsx({ "text-primary": sort === "asc" })} />
        <TriangleDownIcon
          width={8}
          height={8}
          className={clsx({ "text-primary": sort === "desc" })}
        />
      </div>
    </div>
  );
}
