import { useMemo } from "react";
import { formatAge } from "@/libs/format";
import { ListField } from "@/components/ListField";
import { Token } from "@chainstream-io/sdk";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { tickAtom } from "@liberfi/ui-base";

interface AgeFieldProps {
  className?: string;
  token: Token;
}

export function AgeField({ className, token }: AgeFieldProps) {
  const now = useAtomValue(tickAtom);

  const age = useMemo(
    () => (token.tokenCreatedAt ? formatAge(token.tokenCreatedAt, now) : undefined),
    [token, now],
  );

  return (
    <ListField width={54} className={className}>
      <div className={clsx(age ? "text-foreground" : "text-neutral")}>{age ?? "--"}</div>
    </ListField>
  );
}
