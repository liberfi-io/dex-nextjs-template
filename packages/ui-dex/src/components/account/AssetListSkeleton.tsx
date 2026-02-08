import { Skeleton } from "@heroui/react";
import clsx from "clsx";
import { ListField } from "../ListField";

export type AssetListSkeletonProps = {
  rows?: number;
  compact?: boolean;
  classNames?: {
    itemWrapper?: string;
    item?: string;
  };
};

export function AssetListSkeleton({
  rows = 3,
  compact = false,
  classNames,
}: AssetListSkeletonProps) {
  return [...Array(rows)].map((_, index) => (
    <div
      key={index}
      className={clsx("group w-full h-16", classNames?.itemWrapper)}
      data-compact={compact}
    >
      <div
        className={clsx(
          "w-full h-full flex items-center justify-between lg:group-data-[compact=false]:gap-1",
          classNames?.item,
        )}
      >
        <ListField
          className="lg:group-data-[compact=false]:w-[200px] max-lg:flex-1 lg:group-data-[compact=true]:flex-1 pr-2 lg:group-data-[compact=false]:pr-4"
          shrink
        >
          <Skeleton className="w-full h-8 rounded-lg lg:group-data-[compact=false]:ml-2.5" />
        </ListField>
        <ListField
          className="lg:group-data-[compact=false]:w-[120px] max-lg:flex-1 lg:group-data-[compact=true]:flex-1 max-lg:hidden lg:group-data-[compact=true]:hidden lg:group-data-[compact=false]:pr-2"
          shrink
        >
          <Skeleton className="w-full h-8 rounded-lg" />
        </ListField>
        <ListField
          className="lg:group-data-[compact=false]:w-[220px] max-lg:flex-1 lg:group-data-[compact=true]:flex-1 max-lg:hidden lg:group-data-[compact=true]:hidden lg:group-data-[compact=false]:pr-2"
          shrink
        >
          <Skeleton className="w-full h-8 rounded-lg" />
        </ListField>
        <ListField
          className="lg:group-data-[compact=false]:w-[110px] max-lg:flex-[0.7] lg:group-data-[compact=true]:flex-[0.7] lg:group-data-[compact=false]:pr-2"
          shrink
        >
          <Skeleton className="w-full h-8 rounded-lg" />
        </ListField>
        <ListField
          className="lg:group-data-[compact=false]:w-[110px] max-lg:flex-1 lg:group-data-[compact=true]:flex-1 pl-2 lg:group-data-[compact=false]:pl-0"
          shrink
        >
          <Skeleton className="w-full h-8 rounded-lg" />
        </ListField>
        <ListField
          className="lg:group-data-[compact=false]:w-[50px] max-lg:flex-[0.3] lg:group-data-[compact=true]:flex-[0.3]"
          shrink
        >
          <div className="flex justify-center items-center">
            <Skeleton className="w-5 h-5 rounded-full" />
          </div>
        </ListField>
      </div>
    </div>
  ));
}
