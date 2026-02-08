import { Button } from "@heroui/react";
import clsx from "clsx";
import { PropsWithChildren } from "react";
import { useAtomValue } from "jotai";
import { layoutAtom } from "@liberfi/ui-base";

export type TokenListTabProps = PropsWithChildren<{
  active?: boolean;
  label: string;
  action?: () => void;
  icon?: React.ReactNode;
  layout?: "desktop" | "mobile";
}>;

export function TokenListTab({ label, action, icon, active, children, layout }: TokenListTabProps) {
  const appLayout = useAtomValue(layoutAtom);

  return (
    <>
      {/* desktop */}
      {layout !== "mobile" && appLayout === "desktop" && (
        <div
          className={clsx(
            "hidden lg:flex h-10 px-4 items-center gap-2.5 rounded-lg",
            active && "bg-content1",
          )}
        >
          <Button
            className={clsx(
              "flex min-h-0 min-w-0 w-auto h-auto px-0 text-sm font-semibold bg-transparent shrink-0 rounded-none",
              active ? "text-foreground" : "text-neutral",
            )}
            startContent={icon}
            onPress={action}
            disableRipple
          >
            {label}
          </Button>
          {children}
        </div>
      )}

      {/* mobile */}
      {(layout === "mobile" || appLayout !== "desktop") && (
        <Button
          isIconOnly
          className={clsx(
            "flex w-9 min-w-0 h-9 min-h-9 rounded-full bg-content1 text-neutral",
            active && "text-bullish",
          )}
          onPress={action}
          disableRipple
        >
          {icon}
        </Button>
      )}
    </>
  );
}
