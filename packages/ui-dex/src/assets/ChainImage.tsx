import { Avatar, Image } from "@heroui/react";
import { Chain } from "@liberfi/core";
import { chainIcon, chainSlug } from "@liberfi.io/utils";
import clsx from "clsx";

type Props = {
  chainId: Chain;
  className?: string;
  width?: number;
  height?: number;
};

export function chainImageUrl(chainId: Chain) {
  switch (chainId) {
    case Chain.SOLANA:
      return `https://static.particle.network/chains/solana/icons/${chainId}.png`;
    case Chain.ETHEREUM:
    case Chain.BASE:
    case Chain.ARBITRUM:
    case Chain.BINANCE:
    case Chain.AVALANCHE:
    case Chain.POLYGON:
    case Chain.OPTIMISM:
    case Chain.LINEA:
      return `https://static.particle.network/chains/evm/icons/${chainId}.png`;
    default:
      return chainIcon(chainId);
  }
}

export function ChainImage({ className, chainId, width, height }: Props) {
  const src = chainImageUrl(chainId);
  if (src) {
    return (
      <Image
        src={src}
        classNames={{ img: clsx("z-0", className) }}
        alt={chainSlug(chainId)}
        width={width ?? 24}
        height={height ?? 24}
      />
    );
  }
  return (
    <Avatar
      name={chainSlug(chainId)?.slice(0, 1)?.toUpperCase() ?? chainId}
      color="primary"
      className={clsx("text-xl", className)}
      style={{ width: `${width ?? 24}px`, height: `${height ?? 24}px` }}
    />
  );
}
