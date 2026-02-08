import { TokenListTab } from "./TokenListTab";
import { useTokenListContext } from "../TokenListContext";
import { useCallback } from "react";
import { useTranslation, XStocksFilledIcon } from "@liberfi/ui-base";

export type StocksTabProps = {
  layout?: "desktop" | "mobile";
};

export function StocksTab({ layout }: StocksTabProps) {
  const { t } = useTranslation();
  const { type, setType } = useTokenListContext();

  const handleAction = useCallback(() => {
    setType("stocks");
  }, [setType]);

  return (
    <TokenListTab
      label={t("extend.token_list.types.stocks")}
      action={handleAction}
      icon={<XStocksFilledIcon width={24} height={24} className="shrink-0" />}
      active={type === "stocks"}
      layout={layout}
    />
  );
}
