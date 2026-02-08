import clsx from "clsx";
import { PropsWithChildren } from "react";

export type ModalWrapperProps = {
  className?: string;
};

export function ModalWrapper({ children, className }: PropsWithChildren<ModalWrapperProps>) {
  return (
    <div className={clsx("w-full h-full bg-background lg:bg-content2 flex flex-col", className)}>
      {children}
    </div>
  );
}
