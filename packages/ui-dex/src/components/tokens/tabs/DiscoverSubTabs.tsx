import { useTranslation } from "@liberfi/ui-base";
import { useTokenListContext } from "../TokenListContext";
import { TokenListSubTab } from "./TokenListSubTab";

const subTypes = ["trending", "new" /*, "gainers", "losers"*/];

export type DiscoverSubTabsProps = {
  layout?: "desktop" | "mobile";
};

export function DiscoverSubTabs({ layout }: DiscoverSubTabsProps) {
  const { t } = useTranslation();
  const { type, subType, setType } = useTokenListContext();

  return subTypes.map((subTypeItem) => (
    <TokenListSubTab
      key={subTypeItem}
      label={t(`extend.token_list.discover.${subTypeItem}`)}
      action={() => setType("discover", subTypeItem)}
      active={type === "discover" && subType === subTypeItem}
      layout={layout}
    />
  ));
}
