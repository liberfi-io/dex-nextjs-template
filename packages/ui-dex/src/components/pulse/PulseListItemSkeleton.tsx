import { Skeleton } from "@heroui/react";
import { clsx } from "clsx";
import { usePulseListContext } from "./PulseListContext";

export type PulseListItemSkeletonProps = {
  isLast?: boolean;
  className?: string;
};

export function PulseListItemSkeleton({ isLast = false, className }: PulseListItemSkeletonProps) {
  const { layout } = usePulseListContext();

  return (
    <div
      className={clsx(
        "w-full px-3 pt-3 py-1 overflow-hidden flex flex-col gap-2 group",
        layout === "narrow" ? "h-[152px]" : "h-[124px]",
        !isLast && "border-b border-border",
        className,
      )}
      data-layout={layout}
    >
      <div className="relative flex justify-between gap-3">
        {/* left: token avatar */}
        <div className="flex-none">
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="w-20 h-20 rounded" />
            <Skeleton className="w-18 h-4 rounded" />
          </div>
        </div>

        {/* center: token infos */}
        <div className="flex-1 flex flex-col justify-between gap-3 overflow-hidden">
          {/* center top */}
          <div className="w-full flex flex-col gap-1.5">
            <Skeleton className="w-30 h-6 rounded" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-45 h-5 rounded" />
            </div>
          </div>

          {/* center bottom */}
          <div className="w-full flex flex-col gap-1.5">
            <Skeleton className="w-60 h-5 rounded" />
          </div>

          <div className="absolute top-0 right-0 flex flex-col gap-2 items-end">
            <Skeleton className="w-18 h-4 rounded" />
            <Skeleton className="w-12 h-4 rounded" />
            <Skeleton className="w-14 h-4 rounded" />
          </div>
        </div>
      </div>

      <div className="group-data-[layout=wide]:hidden"></div>
    </div>
  );
}
