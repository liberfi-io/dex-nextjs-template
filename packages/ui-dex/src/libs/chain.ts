import { Chain } from "@liberfi/core";
import { chainSlug } from "@liberfi.io/utils";

/** 链的显示名称（简称），用于 UI 展示 */
export const chainDisplayNames: Partial<Record<Chain, string>> = {
  [Chain.ETHEREUM]: "ETH",
  [Chain.BINANCE]: "BSC",
  [Chain.SOLANA]: "SOL",
  [Chain.POLYGON]: "Polygon",
  [Chain.ARBITRUM]: "Arbitrum",
  [Chain.OPTIMISM]: "OP",
  [Chain.AVALANCHE]: "AVAX",
  [Chain.BASE]: "Base",
  [Chain.FANTOM]: "FTM",
  [Chain.CRONOS]: "CRO",
  [Chain.XDAI]: "Gnosis",
  [Chain.ZKSYNC_ERA]: "zkSync",
  [Chain.LINEA]: "Linea",
  [Chain.SCROLL]: "Scroll",
  [Chain.BLAST]: "Blast",
  [Chain.MANTLE]: "Mantle",
  [Chain.MOONBEAM]: "Moonbeam",
  [Chain.CELO]: "Celo",
  [Chain.HARMONY]: "ONE",
  [Chain.METIS]: "Metis",
  [Chain.BOBA]: "Boba",
  [Chain.KAVA]: "Kava",
  [Chain.KLAYTN]: "Klaytn",
  [Chain.AURORA]: "Aurora",
  [Chain.FUSE]: "Fuse",
  [Chain.EVMOS]: "Evmos",
  [Chain.CANTO]: "Canto",
  [Chain.PULSE]: "PLS",
  [Chain.CORE]: "Core",
  [Chain.MANTA]: "Manta",
  [Chain.SEI]: "Sei",
  [Chain.BERACHAIN]: "Bera",
  [Chain.MODE]: "Mode",
  [Chain.TAIKO]: "Taiko",
  [Chain.SONIC]: "Sonic",
};

/**
 * 获取链的显示名称
 * 优先使用 chainDisplayNames，如果没有则使用 chainSlug 首字母大写
 */
export function getChainDisplayName(chain: Chain): string {
  if (chainDisplayNames[chain]) {
    return chainDisplayNames[chain];
  }
  const slug = chainSlug(chain);
  if (slug) {
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  }
  return "";
}

