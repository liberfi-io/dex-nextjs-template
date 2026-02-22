import { PropsWithChildren } from "react";
import { clsx } from "clsx";
import { Button, ModalHeader as HeroModalHeader } from "@heroui/react";
import { ChevronLeftIcon, XCloseIcon } from "../../icons";

export type ModalHeaderProps = PropsWithChildren<{
  full?: boolean;
  onClose?: () => void;
  className?: string;
}>;

export function ModalHeader({ full = false, onClose, className, children }: ModalHeaderProps) {
  return (
    <HeroModalHeader
      className={clsx("justify-between items-center max-lg:px-4 text-base", className)}
    >
      <div className="flex items-center gap-2">
        <Button
          isIconOnly
          className={clsx("bg-transparent w-7 min-w-7 h-7 min-h-7", { hidden: !full })}
          disableRipple
          onPress={onClose}
        >
          <ChevronLeftIcon />
        </Button>
        {children}
      </div>
      <Button
        isIconOnly
        className={clsx("bg-transparent w-7 min-w-7 h-7 min-h-7", { hidden: full })}
        disableRipple
        onPress={onClose}
      >
        <XCloseIcon />
      </Button>
    </HeroModalHeader>
  );
}
