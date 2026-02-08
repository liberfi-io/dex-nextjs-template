import { layoutAtom, useTranslation } from "@liberfi/ui-base";
import { useAtomValue } from "jotai";

export type HoldingsSubTabsProps = {
  layout?: "desktop" | "mobile";
};

export function HoldingsSubTabs({ layout }: HoldingsSubTabsProps) {
  const { t } = useTranslation();

  const appLayout = useAtomValue(layoutAtom);

  if (layout === "mobile" || appLayout !== "desktop") {
    return (
      <div className="h-7 text-sm text-foreground font-medium flex items-center">
        {t(`extend.token_list.types.holdings`)}
      </div>
    );
  }
  return <></>;
}
