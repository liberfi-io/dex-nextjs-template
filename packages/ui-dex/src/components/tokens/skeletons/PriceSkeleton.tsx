import { ListField } from "../../ListField";
import { Skeleton } from "@heroui/react";

export function PriceSkeleton() {
  return (
    <ListField width={130} className="pr-8">
      <Skeleton className="w-full h-8 rounded-lg" />
    </ListField>
  );
}
