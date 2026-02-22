import { ListField } from "../../ListField";
import { Skeleton } from "@heroui/react";

export function MarketCapSkeleton() {
  return (
    <ListField width={146} className="pr-8">
      <Skeleton className="w-full h-8 rounded-lg" />
    </ListField>
  );
}
