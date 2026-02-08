import { useCallback } from "react";
import { Token } from "@chainstream-io/sdk";
import { useTranslation } from "@liberfi/ui-base";
import { usePulseWsNewTokens } from "@/hooks";
import { PulseList } from "./PulseList";
import { PulseListItemBondingTooltip } from "./PulseListItemBondingTooltip";
import { RecursivePartial } from "@liberfi/core";

export function PulseNewList() {
  const { t } = useTranslation();
  const tokens = usePulseWsNewTokens();
  const renderTooltip = useCallback(
    (token: RecursivePartial<Token>) => <PulseListItemBondingTooltip token={token} />,
    [],
  );
  return (
    <PulseList
      title={t("extend.pulse.new")}
      tokens={tokens}
      renderTooltip={renderTooltip}
      className="border-r-0 rounded-l-lg max-lg:rounded-r-lg"
    />
  );
}
