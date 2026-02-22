import { useCallback } from "react";
import { Token } from "@chainstream-io/sdk";
import { useTranslation } from "@liberfi/ui-base";
import { usePulseFinalStretchTokens } from "../../hooks";
import { PulseList } from "./PulseList";
import { PulseListItemBondingTooltip } from "./PulseListItemBondingTooltip";
import { RecursivePartial } from "@liberfi/core";

export function PulseFinalStretchList() {
  const { t } = useTranslation();
  const tokens = usePulseFinalStretchTokens();
  const renderTooltip = useCallback(
    (token: RecursivePartial<Token>) => <PulseListItemBondingTooltip token={token} />,
    [],
  );
  return (
    <PulseList
      title={t("extend.pulse.final_stretch")}
      tokens={tokens}
      renderTooltip={renderTooltip}
      className="border-r-0 max-lg:rounded-lg"
    />
  );
}
