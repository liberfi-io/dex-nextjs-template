import { CHAIN_ID, chainSlugs } from "@liberfi/core";

/** 链的显示名称（简称），用于 UI 展示 */
export const chainDisplayNames: Partial<Record<CHAIN_ID, string>> = {
  [CHAIN_ID.ETHEREUM]: "ETH",
  [CHAIN_ID.BINANCE]: "BSC",
  [CHAIN_ID.SOLANA]: "SOL",
  [CHAIN_ID.POLYGON]: "Polygon",
  [CHAIN_ID.ARBITRUM]: "Arbitrum",
  [CHAIN_ID.OPTIMISM]: "OP",
  [CHAIN_ID.AVALANCHE]: "AVAX",
  [CHAIN_ID.BASE]: "Base",
  [CHAIN_ID.FANTOM]: "FTM",
  [CHAIN_ID.CRONOS]: "CRO",
  [CHAIN_ID.XDAI]: "Gnosis",
  [CHAIN_ID.ZKSYNC_ERA]: "zkSync",
  [CHAIN_ID.LINEA]: "Linea",
  [CHAIN_ID.SCROLL]: "Scroll",
  [CHAIN_ID.BLAST]: "Blast",
  [CHAIN_ID.MANTLE]: "Mantle",
  [CHAIN_ID.MOONBEAM]: "Moonbeam",
  [CHAIN_ID.CELO]: "Celo",
  [CHAIN_ID.HARMONY]: "ONE",
  [CHAIN_ID.METIS]: "Metis",
  [CHAIN_ID.BOBA]: "Boba",
  [CHAIN_ID.KAVA]: "Kava",
  [CHAIN_ID.KLAYTN]: "Klaytn",
  [CHAIN_ID.AURORA]: "Aurora",
  [CHAIN_ID.FUSE]: "Fuse",
  [CHAIN_ID.EVMOS]: "Evmos",
  [CHAIN_ID.CANTO]: "Canto",
  [CHAIN_ID.PULSE]: "PLS",
  [CHAIN_ID.CORE]: "Core",
  [CHAIN_ID.MANTA]: "Manta",
  [CHAIN_ID.SEI]: "Sei",
  [CHAIN_ID.BERACHAIN]: "Bera",
  [CHAIN_ID.MODE]: "Mode",
  [CHAIN_ID.TAIKO]: "Taiko",
  [CHAIN_ID.SONIC]: "Sonic",
};

/**
 * 获取链的显示名称
 * 优先使用 chainDisplayNames，如果没有则使用 chainSlugs 首字母大写
 */
export function getChainDisplayName(chain: CHAIN_ID): string {
  if (chainDisplayNames[chain]) {
    return chainDisplayNames[chain];
  }
  const slug = chainSlugs[chain];
  if (slug) {
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  }
  return "";
}

