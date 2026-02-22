import { useCallback } from "react";
import { Token } from "@chainstream-io/sdk";
import { useTranslation } from "@liberfi/ui-base";
import { usePulseMigratedTokens } from "../../hooks";
import { PulseList } from "./PulseList";
import { PulseListItemMigratedDappProgramTooltip } from "./PulseListItemMigratedDappProgramTooltip";
import { RecursivePartial } from "@liberfi/core";

export function PulseMigratedList() {
  const { t } = useTranslation();
  const tokens = usePulseMigratedTokens();
  const renderTooltip = useCallback(
    (token: RecursivePartial<Token>) =>
      token.extra?.migratedToProtocolFamily ? (
        <PulseListItemMigratedDappProgramTooltip token={token} />
      ) : undefined,
    [],
  );
  return (
    <PulseList
      title={t("extend.pulse.migrated")}
      tokens={tokens}
      renderTooltip={renderTooltip}
      className="rounded-r-lg max-lg:rounded-l-lg"
    />
  );
}
