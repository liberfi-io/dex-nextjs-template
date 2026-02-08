import { TokenListTab } from "./TokenListTab";
import { HoldingsOutlinedIcon } from "@/assets/icons";
import { useTokenListContext } from "../TokenListContext";
import { useCallback } from "react";
import { useTranslation } from "@liberfi/ui-base";

export type HoldingsTabProps = {
  layout?: "desktop" | "mobile";
};

export function HoldingsTab({ layout }: HoldingsTabProps) {
  const { t } = useTranslation();
  const { type, setType } = useTokenListContext();

  const handleAction = useCallback(() => {
    setType("holdings");
  }, [setType]);

  return (
    <TokenListTab
      label={t("extend.token_list.types.holdings")}
      action={handleAction}
      icon={<HoldingsOutlinedIcon width={24} height={24} className="shrink-0" />}
      active={type === "holdings"}
      layout={layout}
    />
  );
}
