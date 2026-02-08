import { useCallback } from "react";
import { DiscoveryIcon } from "@/assets/icons";
import { useTranslation } from "@liberfi/ui-base";
import { useTokenListContext } from "../TokenListContext";
import { TokenListTab } from "./TokenListTab";
import { DiscoverSubTabs } from "./DiscoverSubTabs";

export type DiscoverTabProps = {
  layout?: "desktop" | "mobile";
};

export function DiscoverTab({ layout }: DiscoverTabProps) {
  const { t } = useTranslation();
  const { type, setType } = useTokenListContext();

  const handleAction = useCallback(() => {
    setType("discover", "trending");
  }, [setType]);

  return (
    <TokenListTab
      label={t("extend.token_list.types.discover")}
      action={handleAction}
      icon={<DiscoveryIcon width={24} height={24} className="shrink-0" />}
      active={type === "discover"}
      layout={layout}
    >
      {type === "discover" && <DiscoverSubTabs layout={layout} />}
    </TokenListTab>
  );
}
