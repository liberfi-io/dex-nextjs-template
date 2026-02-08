import { TokenListTab } from "./TokenListTab";
import { ViewListOutlinedIcon } from "@/assets/icons";
import { useTokenListContext } from "../TokenListContext";
import { useCallback } from "react";
import { useTranslation } from "@liberfi/ui-base";

export type ViewListTabProps = {
  layout?: "desktop" | "mobile";
};

export function ViewListTab({ layout }: ViewListTabProps) {
  const { t } = useTranslation();
  const { type, setType } = useTokenListContext();

  const handleAction = useCallback(() => {
    setType("views");
  }, [setType]);

  return (
    <TokenListTab
      label={t("extend.token_list.types.views")}
      action={handleAction}
      icon={<ViewListOutlinedIcon width={24} height={24} className="shrink-0" />}
      active={type === "views"}
      layout={layout}
    />
  );
}
