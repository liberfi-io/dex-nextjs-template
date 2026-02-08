import { ListField } from "@/components/ListField";
import { Skeleton } from "@heroui/react";

export function FavoriteSkeleton() {
  return (
    <ListField width={44} grow={false}>
      <div className="flex items-center justify-center">
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    </ListField>
  );
}
