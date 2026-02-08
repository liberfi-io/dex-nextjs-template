import { Skeleton } from "@heroui/react";

export function TradeInputSkeletons() {
  return (
    <>
      <div className="w-full h-12 py-2">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
      <Skeleton className="mt-2 h-5 rounded-lg" />
    </>
  );
}
