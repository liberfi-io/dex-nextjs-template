import { ArrowLeftIcon } from "../../assets";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { PropsWithChildren } from "react";

export type ModalHeaderWrapperProps = PropsWithChildren<{
  onClose?: () => void;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}>;

export function ModalHeaderWrapper({
  children,
  onClose,
  startContent,
  endContent,
}: ModalHeaderWrapperProps) {
  return (
    <div
      className={clsx(
        "flex-none w-full h-[var(--header-height)] px-4 sm:pr-6",
        "flex items-center justify-between gap-2",
      )}
    >
      {/* back button */}
      <Button
        isIconOnly
        className="flex flex-0 w-8 min-w-0 h-8 min-h-0 bg-transparent text-foreground lg:hidden"
        disableRipple
        onPress={onClose}
      >
        <ArrowLeftIcon />
      </Button>

      {startContent && <div className="flex-0 flex items-center">{startContent}</div>}

      <div className="flex-1">{children}</div>

      {endContent && <div className="flex-0 flex items-center">{endContent}</div>}
    </div>
  );
}
