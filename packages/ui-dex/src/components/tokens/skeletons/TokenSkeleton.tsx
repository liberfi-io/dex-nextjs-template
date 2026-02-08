import { ListField } from "@/components/ListField";
import { Skeleton } from "@heroui/react";

export function TokenSkeleton() {
  return (
    <ListField width={160} className="pr-8">
      <Skeleton className="w-full h-8 rounded-lg" />
    </ListField>
  );
}
