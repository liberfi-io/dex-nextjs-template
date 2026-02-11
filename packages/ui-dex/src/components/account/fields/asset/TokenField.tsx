import { TokenAvatar } from "@/components/TokenAvatar";
import { ListField } from "@/components/ListField";
import { Token, WalletNetWorthItemDTO } from "@chainstream-io/sdk";
import { Number } from "@/components/Number";
import { useMemo } from "react";

export interface TokenFieldProps {
  className?: string;
  token?: Token;
  balance: WalletNetWorthItemDTO;
  compact?: boolean;
}

export function TokenField({ className, token, balance, compact = false }: TokenFieldProps) {
  const price = useMemo(
    () => token?.marketData?.priceInUsd ?? balance.priceInUsd,
    [token, balance],
  );

  return (
    <ListField className={className} shrink>
      <div
        className="group lg:data-[compact=false]:ml-2.5 flex items-center gap-2"
        data-compact={compact}
      >
        <div className="flex shrink-0 items-center">
          <TokenAvatar src={token?.imageUrl ?? ""} name={token?.symbol} size={32} />
        </div>
        <div className="flex flex-col justify-between overflow-hidden">
          <div className="max-lg:text-xs text-sm text-foreground lg:group-data-[compact=true]:text-xs">
            {token?.symbol ?? balance.symbol}
          </div>
          <div className="max-lg:hidden max-lg:text-xxs text-xs lg:group-data-[compact=true]:hidden lg:group-data-[compact=true]:text-xxs text-neutral overflow-hidden text-ellipsis whitespace-nowrap">
            {token?.name ?? balance.name}
          </div>
          <div className="lg:group-data-[compact=false]:hidden max-lg:text-xxs text-xs lg:group-data-[compact=true]:text-xxs text-neutral">
            {price ? <Number value={price} defaultCurrencySign="$" /> : "-"}
          </div>
        </div>
      </div>
    </ListField>
  );
}
