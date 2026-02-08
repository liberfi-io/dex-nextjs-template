import { ListField } from "@/components/ListField";
import { Skeleton } from "@heroui/react";
import clsx from "clsx";

export function SocialMediaSkeleton({ className }: { className?: string }) {
  return (
    <ListField width={70} className={clsx("pr-8", className)}>
      <Skeleton className="w-full h-8 rounded-lg" />
    </ListField>
  );
}
