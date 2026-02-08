import { ListField } from "@/components/ListField";
import { Skeleton } from "@heroui/react";

export function HoldersSkeleton() {
  return (
    <ListField width={184} className="pr-8">
      <Skeleton className="w-full h-8 rounded-lg" />
    </ListField>
  );
}
