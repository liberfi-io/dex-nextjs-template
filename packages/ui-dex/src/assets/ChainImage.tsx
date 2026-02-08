import { Avatar, Image } from "@heroui/react";
import { CHAIN_ID, chainIcon, chainSlugs } from "@liberfi/core";
import clsx from "clsx";

type Props = {
  chainId: CHAIN_ID;
  className?: string;
  width?: number;
  height?: number;
};

export function chainImageUrl(chainId: CHAIN_ID) {
  switch (chainId) {
    case CHAIN_ID.SOLANA:
      return `https://static.particle.network/chains/solana/icons/${chainId}.png`;
    case CHAIN_ID.ETHEREUM:
    case CHAIN_ID.BASE:
    case CHAIN_ID.ARBITRUM:
    case CHAIN_ID.BINANCE:
    case CHAIN_ID.AVALANCHE:
    case CHAIN_ID.POLYGON:
    case CHAIN_ID.OPTIMISM:
    case CHAIN_ID.LINEA:
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
        alt={chainSlugs[chainId]}
        width={width ?? 24}
        height={height ?? 24}
      />
    );
  }
  return (
    <Avatar
      name={chainSlugs[chainId]?.slice(0, 1)?.toUpperCase() ?? chainId}
      color="primary"
      className={clsx("text-xl", className)}
      style={{ width: `${width ?? 24}px`, height: `${height ?? 24}px` }}
    />
  );
}
