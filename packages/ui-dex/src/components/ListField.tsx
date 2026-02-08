import { PropsWithChildren } from "react";
import clsx from "clsx";

export type ListFieldProps = PropsWithChildren<{
  className?: string;
  width?: number;
  grow?: boolean;
  shrink?: boolean;
}>;

export function ListField({
  children,
  grow = true,
  shrink = false,
  width,
  className,
}: ListFieldProps) {
  return (
    <div
      className={clsx(
        "text-xs text-neutral",
        grow ? "grow" : "grow-0",
        shrink ? "shrink" : "shrink-0",
        className,
      )}
      style={width !== undefined ? { width: `${width}px` } : undefined}
    >
      {children}
    </div>
  );
}
