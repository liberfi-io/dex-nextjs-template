import { Avatar, BinanceIcon, EthereumIcon, SolanaIcon } from "@liberfi.io/ui";
import { capitalizeString } from "@liberfi.io/utils";
import { CHAIN_ID, chainSlugs } from "@liberfi/core";

export type ChainAvatarProps = {
  chain: CHAIN_ID;
  className?: string;
};

export function ChainAvatar({ chain, className }: ChainAvatarProps) {
  switch (chain) {
    case CHAIN_ID.SOLANA:
      return <SolanaIcon className={className} />;
    case CHAIN_ID.ETHEREUM:
      return <EthereumIcon className={className} />;
    case CHAIN_ID.BINANCE:
      return <BinanceIcon className={className} />;
    default:
      return <Avatar className={className} name={capitalizeString(chainSlugs[chain] ?? "")} />;
  }
}
