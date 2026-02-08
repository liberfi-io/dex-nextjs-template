import clsx from "clsx";
import { PropsWithChildren } from "react";

export type ListHeaderProps = PropsWithChildren<{
  className?: string;
  width?: number;
  grow?: boolean;
  shrink?: boolean;
}>;

export function ListHeader({
  children,
  grow = true,
  shrink = false,
  width,
  className,
}: ListHeaderProps) {
  return (
    <div
      className={clsx(grow ? "grow" : "grow-0", shrink ? "shrink" : "shrink-0", className)}
      style={width !== undefined ? { width: `${width}px` } : undefined}
    >
      {children}
    </div>
  );
}
