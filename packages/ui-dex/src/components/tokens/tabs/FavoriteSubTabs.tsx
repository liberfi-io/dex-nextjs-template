import { layoutAtom, useTranslation } from "@liberfi/ui-base";
import { useAtomValue } from "jotai";

export type FavoriteSubTabsProps = {
  layout?: "desktop" | "mobile";
};

export function FavoriteSubTabs({ layout }: FavoriteSubTabsProps) {
  const { t } = useTranslation();

  const appLayout = useAtomValue(layoutAtom);

  if (layout === "mobile" || appLayout !== "desktop") {
    return (
      <div className="h-7 text-sm text-foreground font-medium flex items-center">
        {t(`extend.token_list.types.favorite`)}
      </div>
    );
  }
  return <></>;
}
