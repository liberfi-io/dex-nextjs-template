import { ListField } from "../../ListField";
import { TokenAvatar } from "../../TokenAvatar";
import { formatAge } from "../../../libs/format";
import clsx from "clsx";
import { Token } from "@chainstream-io/sdk";
import { Number } from "../../Number";
import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { tickAtom } from "@liberfi/ui-base";

export interface CompositeMobileFieldProps {
  className?: string;
  token: Token;
}

export function CompositeMobileField({ className, token }: CompositeMobileFieldProps) {
  const now = useAtomValue(tickAtom);

  const age = useMemo(
    () => (token.tokenCreatedAt ? formatAge(token.tokenCreatedAt, now) : undefined),
    [token.tokenCreatedAt, now],
  );

  return (
    <ListField className={clsx("w-auto basis-0", className)} grow shrink>
      <div className="w-full flex items-center gap-2">
        <TokenAvatar src={token.imageUrl ?? ""} name={token.symbol} size={32} />
        <div className="flex flex-col gap-0.5">
          <div className="grow flex items-center gap-1 overflow-hidden">
            <div
              className={clsx(
                "max-w-full text-xs font-medium text-foreground",
                "overflow-hidden truncate text-ellipsis whitespace-nowrap",
              )}
            >
              {token.symbol}
            </div>
            {token.tokenCreatedAt && (
              <div className="flex h-3.5 items-center justify-center rounded-lg bg-content2 px-1">
                {age}
              </div>
            )}
          </div>
          {(token.marketData.marketCapInUsd || token.marketData.totalTvlInUsd) && (
            <div className="w-full flex shrink-0 items-center gap-2 overflow-hidden text-xs text-neutral">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {token.marketData.marketCapInUsd ? (
                  <Number
                    value={token.marketData.marketCapInUsd}
                    abbreviate
                    defaultCurrencySign="$"
                  />
                ) : (
                  "-"
                )}
              </div>
              <div>•</div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                {token.marketData.totalTvlInUsd ? (
                  <Number value={token.marketData.totalTvlInUsd} abbreviate defaultCurrencySign="$" />
                ) : (
                  "-"
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ListField>
  );
}
