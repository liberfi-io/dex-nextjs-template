import { Skeleton } from "@heroui/react";
import { TradeInputSkeletons } from "./TradeInputSkeletons";

// TODO @deprecated
export function TradeOperationsSkeletons() {
  return (
    <div className="w-full flex flex-col">
      <div className="p-3 bg-content2 rounded-lg">
        <Skeleton className="w-full h-8 rounded-lg" />
        <TradeInputSkeletons />
      </div>

      <Skeleton className="mt-2 w-full h-10 rounded-lg" />
    </div>
  );
}
