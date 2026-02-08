import { ListField } from "@/components/ListField";
import { Skeleton } from "@heroui/react";
import clsx from "clsx";

export function AgeSkeleton({ className }: { className?: string }) {
  return (
    <ListField width={54} className={clsx("pr-8", className)}>
      <Skeleton className="w-full h-8 rounded-lg" />
    </ListField>
  );
}
