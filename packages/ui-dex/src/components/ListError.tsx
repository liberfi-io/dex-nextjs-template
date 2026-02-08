import clsx from "clsx";
import { EmptyData } from "./EmptyData";

export type ListErrorProps = {
  error?: unknown;
  className?: string;
};

// TODO error message
export function ListError({ className }: ListErrorProps) {
  return (
    <div className={clsx("flex items-start justify-center py-8 lg:py-20", className)}>
      <EmptyData />
    </div>
  );
}
