import { useAtomValue } from "jotai";
import { Link, Tooltip } from "@heroui/react";
import { tickAtom } from "@liberfi/ui-base";
import { Token } from "@chainstream-io/sdk";
import { useMemo } from "react";
import { formatAge } from "../../libs";
import { RecursivePartial, ROUTES } from "@liberfi/core";

export type PulseTokenCreatedAtProps = {
  token: RecursivePartial<Token>;
};

export function PulseTokenCreatedAt({ token }: PulseTokenCreatedAtProps) {
  const now = useAtomValue(tickAtom);

  const age = useMemo(
    () => (token.tokenCreatedAt ? formatAge(token.tokenCreatedAt, now) : undefined),
    [token, now],
  );

  return (
    <Tooltip
      content={new Date(token.tokenCreatedAt ?? 0).toLocaleString()}
      classNames={{ content: "text-xs text-neutral py-2 px-4" }}
      closeDelay={0}
    >
      <Link
        data-recent={now - (token.tokenCreatedAt ?? 0) < 7200_000}
        className="text-sm text-foreground data-[recent=true]:text-primary"
        href={ROUTES.trade.token(token.chain ?? "", token.address ?? "")}
      >
        {age}
      </Link>
    </Tooltip>
  );
}
