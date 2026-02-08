import clsx from "clsx";
import { EmptyData } from "./EmptyData";

export type ListEmptyDataProps = {
  className?: string;
};

export function ListEmptyData({ className }: ListEmptyDataProps) {
  return (
    <div className={clsx("flex items-start justify-center py-8 lg:py-20", className)}>
      <EmptyData />
    </div>
  );
}
