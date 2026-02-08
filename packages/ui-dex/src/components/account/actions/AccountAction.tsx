import { Button, Link } from "@heroui/react";
import clsx from "clsx";

export type AccountActionProps = {
  className?: string;
  icon: React.ReactNode;
  label: string;
  action?: () => void;
  href?: string;
};

export function AccountAction({ icon, label, action, href, className }: AccountActionProps) {
  return (
    <Button
      className={clsx(
        "flex bg-transparent flex-col min-w-0 w-1/5 lg:w-1/3 h-12 min-h-0 p-0 items-center justify-center gap-1",
        className,
      )}
      as={href ? Link : undefined}
      href={href}
      disableRipple
      onPress={action}
    >
      <div className="w-8 h-8 flex justify-center items-center rounded-full bg-default-800 flex-none">
        {icon}
      </div>
      <span className="w-full text-center text-neutral text-xxs">{label}</span>
    </Button>
  );
}
