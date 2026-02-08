import { layoutAtom, useTranslation } from "@liberfi/ui-base";
import { useAtomValue } from "jotai";

export type StocksSubTabsProps = {
  layout?: "desktop" | "mobile";
};

export function StocksSubTabs({ layout }: StocksSubTabsProps) {
  const { t } = useTranslation();

  const appLayout = useAtomValue(layoutAtom);

  if (layout === "mobile" || appLayout !== "desktop") {
    return (
      <div className="h-7 text-sm text-foreground font-medium flex items-center">
        {t(`extend.token_list.types.stocks`)}
      </div>
    );
  }
  return <></>;
}
