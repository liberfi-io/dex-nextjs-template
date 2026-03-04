import { ListField } from "../../../ListField";
import { getWrappedAddress } from "../../../../libs";
import { Token } from "@chainstream-io/sdk";
import { PortfolioPnl } from "@liberfi.io/types";
import { Chain } from "@liberfi/core";
import { Image } from "@heroui/react";
import { useMemo } from "react";

export interface PriceHistoryFieldProps {
  className?: string;
  token?: Token;
  balance: PortfolioPnl;
}

export function PriceHistoryField({ token, balance, className }: PriceHistoryFieldProps) {
  const chainId = Chain[(token?.chain?.toUpperCase() ?? "SOLANA") as keyof typeof Chain];
  const priceImage24H = useMemo(
    () =>
      `https://api-particle-gcp.mobula.io/api/1/market/sparkline?asset=${
        getWrappedAddress(chainId, balance.address) ?? balance.address
      }&blockchain=${chainId}&png=true`,
    [chainId, balance.address],
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
