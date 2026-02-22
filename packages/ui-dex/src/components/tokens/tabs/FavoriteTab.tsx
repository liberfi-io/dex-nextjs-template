import { TokenListTab } from "./TokenListTab";
import { FavoriteOutlinedIcon } from "../../../assets/icons";
import { useTokenListContext } from "../TokenListContext";
import { useCallback } from "react";
import { useTranslation } from "@liberfi/ui-base";

export type FavoriteTabProps = {
  layout?: "desktop" | "mobile";
};

export function FavoriteTab({ layout }: FavoriteTabProps) {
  const { t } = useTranslation();
  const { type, setType } = useTokenListContext();

  const handleAction = useCallback(() => {
    setType("favorite");
  }, [setType]);

  return (
    <TokenListTab
      label={t("extend.token_list.types.favorite")}
      action={handleAction}
      icon={<FavoriteOutlinedIcon width={24} height={24} className="shrink-0" />}
      active={type === "favorite"}
      layout={layout}
    />
  );
}
