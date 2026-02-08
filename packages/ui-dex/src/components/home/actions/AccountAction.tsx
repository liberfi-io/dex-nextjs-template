import { Button, Link } from "@heroui/react";
import clsx from "clsx";

export type AccountActionProps = {
  label: string;
  action?: () => void;
  href?: string;
  className?: string;
  icon?: React.ReactNode;
};

export function AccountAction({ action, href, className, icon, label }: AccountActionProps) {
  return (
    <Button
      as={href ? Link : undefined}
      href={href}
      onPress={action}
      className={clsx(
        "flex bg-transparent flex-col min-w-0 w-1/4 h-auto min-h-0 p-0 items-center justify-center gap-1",
        className,
      )}
      disableRipple
    >
      <div className="w-8 h-8 flex justify-center items-center rounded-full bg-default-800 flex-none">
        {icon}
      </div>
      <span className="w-full text-center text-neutral text-xs">{label}</span>
    </Button>
  );
}
