import { Token } from "@chainstream-io/sdk";
import { RecursivePartial } from "@liberfi/core";

export function PulseListItemMigratedDappProgramTooltip({
  token,
}: {
  token: RecursivePartial<Token>;
}) {
  return <div className="text-xs text-foreground">{token.extra?.migratedToProtocolFamily}</div>;
}
