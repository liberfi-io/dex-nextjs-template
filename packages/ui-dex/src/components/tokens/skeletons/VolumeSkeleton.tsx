import { ListField } from "../../ListField";
import { Skeleton } from "@heroui/react";

export function VolumeSkeleton() {
  return (
    <ListField width={190} className="pr-8">
      <Skeleton className="w-full h-8 rounded-lg" />
    </ListField>
  );
}
