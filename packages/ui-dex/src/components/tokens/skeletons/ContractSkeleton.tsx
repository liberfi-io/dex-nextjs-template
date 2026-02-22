import { ListField } from "../../ListField";
import { Skeleton } from "@heroui/react";
import clsx from "clsx";

export function ContractSkeleton({ className }: { className?: string }) {
  return (
    <ListField width={105} className={clsx("pr-8", className)}>
      <Skeleton className="w-full h-8 rounded-lg" />
    </ListField>
  );
}
