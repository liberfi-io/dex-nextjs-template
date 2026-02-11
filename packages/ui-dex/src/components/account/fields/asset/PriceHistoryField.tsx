import { ListField } from "@/components/ListField";
import { getWrappedAddress } from "@/libs";
import { Token, WalletNetWorthItemDTO } from "@chainstream-io/sdk";
import { CHAIN_ID } from "@liberfi/core";
import { Image } from "@heroui/react";
import { useMemo } from "react";

export interface PriceHistoryFieldProps {
  className?: string;
  token?: Token;
  balance: WalletNetWorthItemDTO;
}

export function PriceHistoryField({ token, balance, className }: PriceHistoryFieldProps) {
  const chainId = CHAIN_ID[(token?.chain?.toUpperCase() ?? "SOLANA") as keyof typeof CHAIN_ID];
  const priceImage24H = useMemo(
    () =>
      `https://api-particle-gcp.mobula.io/api/1/market/sparkline?asset=${
        getWrappedAddress(chainId, balance.tokenAddress) ?? balance.tokenAddress
      }&blockchain=${chainId}&png=true`,
    [chainId, balance.tokenAddress],
  );

  return (
    <ListField grow={false} shrink={false} className={className}>
      <div className="flex items-center z-0">
        <Image
          src={priceImage24H}
          width={180}
          height={48}
          disableSkeleton
          removeWrapper
          classNames={{ img: "z-auto" }}
        />
      </div>
    </ListField>
  );
}
