import { ListField } from "@/components/ListField";
import { Number } from "@/components/Number";
import { Token, WalletBalanceDetailDTO } from "@chainstream-io/sdk";
import { useMemo } from "react";

export interface BalanceFieldProps {
  className?: string;
  token?: Token;
  balance: WalletBalanceDetailDTO;
  compact?: boolean;
}

export function BalanceField({ className, token, balance, compact = false }: BalanceFieldProps) {
  const valueInUsd = useMemo(() => {
    const price = token?.marketData?.priceInUsd ?? balance.priceInUsd;
    // 价格为 0，说明没有价格信息
    return !price || price === "0" ? undefined : balance.valueInUsd;
  }, [balance, token]);

  return (
    <ListField className={className} shrink>
      <div
        className="group flex flex-col justify-center max-lg:items-end max-lg:text-right lg:data-[compact=true]:items-end lg:data-[compact=true]:text-right"
        data-compact={compact}
      >
        <div className="max-lg:text-xs text-sm lg:group-data-[compact=true]:text-xs text-foreground flex items-center">
          {!valueInUsd ? (
            "-"
          ) : (
            <Number value={valueInUsd ?? 0} abbreviate defaultCurrencySign="$" />
          )}
        </div>
        <div className="max-lg:text-xxs text-xs lg:group-data-[compact=true]:text-xxs text-neutral overflow-hidden text-ellipsis whitespace-nowrap">
          <Number value={balance.amount ?? 0} abbreviate />{" "}
          <span className="lg:group-data-[compact=true]:hidden max-lg:hidden">
            {balance.symbol}
          </span>
        </div>
      </div>
    </ListField>
  );
}
