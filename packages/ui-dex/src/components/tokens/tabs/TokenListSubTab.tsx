import { Button } from "@heroui/react";
import clsx from "clsx";
import { TokenListTabProps } from "./TokenListTab";
import { useAtomValue } from "jotai";
import { layoutAtom } from "@liberfi/ui-base";

export type TokenListSubTabProps = TokenListTabProps & {
  layout?: "desktop" | "mobile";
};

export function TokenListSubTab({ label, action, icon, active, layout }: TokenListSubTabProps) {
  const appLayout = useAtomValue(layoutAtom);

  return (
    <Button
      className={clsx(
        "flex px-2.5 min-h-0 min-w-12 w-auto h-7 text-xs rounded-2xl text-neutral bg-transparent shrink-0",
        active && "bg-content1 text-foreground",
        active && (layout === "desktop" || appLayout === "desktop") && "bg-content3",
      )}
      startContent={icon}
      onPress={action}
      disableRipple
    >
      {label}
    </Button>
  );
}
