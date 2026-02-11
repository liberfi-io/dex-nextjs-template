import { BigNumber } from "bignumber.js";
import {
  WsTokenStat as StreamTokenStat,
  WsTokenHolder as StreamTokenHolder,
  WsTokenSupply as StreamTokenSupply,
  WsTokenLiquidity as StreamTokenLiquidity,
  WsRankingTokenList as RankingTokenList,
  WsNewToken as NewToken,
  WsTokenMetadata as TokenMetadata,
} from "@chainstream-io/sdk/stream";
import { Token, TokenMarketData, TokenStat, ChainSymbol } from "@chainstream-io/sdk";
import { CHAIN_ID, chainSlugs, RecursivePartial } from "@liberfi/core";
import { ChainParam, InvalidParamError, Timeframe } from "./types";

/**
 * convert chain id to dex api's chain param
 * @param chain chain id
 * @returns dex api's chain param
 */
export function chainParam(chain: CHAIN_ID): ChainParam {
  switch (chain) {
    case CHAIN_ID.SOLANA:
      return ChainSymbol.sol;
    case CHAIN_ID.BINANCE:
      return ChainSymbol.bsc;
    case CHAIN_ID.ETHEREUM:
      return ChainSymbol.eth;
    default:
      throw new InvalidParamError("chain");
  }
}

export function convertStreamTokenStat(stat: StreamTokenStat): Partial<TokenStat> {
  const statRecord = stat as unknown as Record<string, number | string | undefined>;
  const timeframes: Timeframe[] = ["1m", "5m", "15m", "30m", "1h", "4h", "24h"];

  const periods: TokenStat["periods"] = {} as TokenStat["periods"];

  for (const timeframe of timeframes) {
    const buys = statRecord[`buys${timeframe}`] as number | undefined;
    const sells = statRecord[`sells${timeframe}`] as number | undefined;
    const buyers = statRecord[`buyers${timeframe}`] as number | undefined;
    const sellers = statRecord[`sellers${timeframe}`] as number | undefined;
    const buyVolumeInUsd = statRecord[`buyVolumeInUsd${timeframe}`] as BigNumber.Value | undefined;
    const sellVolumeInUsd = statRecord[`sellVolumeInUsd${timeframe}`] as BigNumber.Value | undefined;
    const trades = statRecord[`trades${timeframe}`] as number | undefined;
    const priceInUsd = statRecord[`price${timeframe}`] as BigNumber.Value | undefined;
    const openInUsd = statRecord[`openInUsd${timeframe}`] as BigNumber.Value | undefined;
    const closeInUsd = statRecord[`closeInUsd${timeframe}`] as BigNumber.Value | undefined;
    const dappProgramCount = statRecord[`dappProgramCount${timeframe}`] as number | undefined;
    const poolCount = statRecord[`poolCount${timeframe}`] as number | undefined;
    const liquidityInUsd = statRecord[`liquidityInUsd${timeframe}`] as BigNumber.Value | undefined;

    const hasData =
      buys !== undefined ||
      sells !== undefined ||
      buyers !== undefined ||
      sellers !== undefined ||
      buyVolumeInUsd !== undefined ||
      sellVolumeInUsd !== undefined ||
      trades !== undefined ||
      priceInUsd !== undefined ||
      openInUsd !== undefined ||
      closeInUsd !== undefined;

    if (!hasData) continue;

    const totalTrades =
      trades ??
      new BigNumber(buys ?? 0)
        .plus(sells ?? 0)
        .toNumber();

    const traders = new BigNumber(buyers ?? 0)
      .plus(sellers ?? 0)
      .toNumber();

    const buyVolume = calculateInQuote(buyVolumeInUsd, priceInUsd);
    const sellVolume = calculateInQuote(sellVolumeInUsd, priceInUsd);

    const totalVolumeInUsd =
      buyVolumeInUsd !== undefined && sellVolumeInUsd !== undefined
        ? new BigNumber(buyVolumeInUsd).plus(sellVolumeInUsd).toString()
        : buyVolumeInUsd?.toString() ?? sellVolumeInUsd?.toString() ?? "0";

    const totalVolume =
      buyVolume !== undefined && sellVolume !== undefined
        ? new BigNumber(buyVolume).plus(sellVolume).toString()
        : buyVolume ?? sellVolume ?? "0";

    const openInNative = calculateInQuote(openInUsd, priceInUsd);
    const closeInNative = calculateInQuote(closeInUsd, priceInUsd);

    periods[timeframe] = {
      buys: (buys ?? 0).toString(),
      sells: (sells ?? 0).toString(),
      trades: totalTrades.toString(),
      buyers: (buyers ?? 0).toString(),
      sellers: (sellers ?? 0).toString(),
      traders: traders.toString(),
      buyVolume: buyVolume ?? "0",
      buyVolumeInUsd: buyVolumeInUsd?.toString() ?? "0",
      buyVolumeInNative: buyVolume ?? "0",
      sellVolume: sellVolume ?? "0",
      sellVolumeInUsd: sellVolumeInUsd?.toString() ?? "0",
      sellVolumeInNative: sellVolume ?? "0",
      totalVolumeInUsd,
      totalVolumeInNative: totalVolume,
      openInUsd: openInUsd?.toString() ?? "0",
      closeInUsd: closeInUsd?.toString() ?? "0",
      highInUsd: openInUsd?.toString() ?? closeInUsd?.toString() ?? "0",
      lowInUsd: openInUsd?.toString() ?? closeInUsd?.toString() ?? "0",
      openInNative: openInNative ?? "0",
      closeInNative: closeInNative ?? "0",
      highInNative: openInNative ?? closeInNative ?? "0",
      lowInNative: openInNative ?? closeInNative ?? "0",
      averagePriceInUsd: priceInUsd?.toString() ?? "0",
      averagePriceInNative: calculateInQuote(priceInUsd, priceInUsd) ?? "0",
      priceChangeRatioInUsd:
        calculatePriceChangeRatio(openInUsd, closeInUsd) ?? "0",
      prevBuys: "0",
      prevSells: "0",
      prevTrades: "0",
      prevBuyers: "0",
      prevSellers: "0",
      prevTraders: "0",
      prevBuyVolume: "0",
      prevSellVolume: "0",
      prevBuyVolumeInUsd: "0",
      prevSellVolumeInUsd: "0",
      prevBuyVolumeInNative: "0",
      prevSellVolumeInNative: "0",
      prevOpenInUsd: "0",
      prevCloseInUsd: "0",
      prevHighInUsd: "0",
      prevLowInUsd: "0",
      prevOpenInNative: "0",
      prevCloseInNative: "0",
      prevHighInNative: "0",
      prevLowInNative: "0",
      dappProgramCount: (dappProgramCount ?? 0).toString(),
      prevDappProgramCount: "0",
      poolCount: (poolCount ?? 0).toString(),
      prevPoolCount: "0",
      currentLiquidityInUsd: liquidityInUsd?.toString() ?? "0",
      prevLiquidityInUsd: "0",
      // WsTokenStat 里对应的是简单字符串比例，这里先不强行映射到复杂对象结构
      volumeChangeRatio: undefined,
      liquidityChangeRatio: undefined,
      buySellRatio: undefined,
      updatedAt: stat.timestamp?.toString(),
    } as TokenStat["periods"][string];
  }

  return {
    address: stat.address,
    periods,
  } as Partial<TokenStat>;
}

export function convertStreamTokenStatToMarketData(
  stat: StreamTokenStat,
  supply?: BigNumber.Value,
): Partial<TokenMarketData> {
  return {
    priceInUsd: stat.price,
    marketCapInUsd:
      supply && stat.price ? new BigNumber(supply).times(stat.price).toString() : undefined,
  };
}

export function convertStreamTokenHoldersToMarketData(
  holder: StreamTokenHolder,
): Partial<TokenMarketData> {
  return {
    holders: holder.holders?.toString(),
    top10HoldingsRatio: holder.top10HoldersRatio,
    top100HoldingsRatio: holder.top100HoldersRatio,
  };
}

export function convertStreamTokenSupplyToMarketData(
  supply: StreamTokenSupply,
  priceInUsd?: BigNumber.Value,
): Partial<TokenMarketData> {
  return {
    totalSupply: supply.supply,
    marketCapInUsd:
      priceInUsd && supply.supply
        ? new BigNumber(priceInUsd).times(supply.supply).toString()
        : undefined,
  };
}

export function convertStreamTokenLiquidityToMarketData(
  liquidity: StreamTokenLiquidity,
): Partial<TokenMarketData> {
  return {
    totalTvlInUsd: liquidity.value,
  };
}

/**
 * calculate value in quote token
 * @param valueInUsd value in usd
 * @param quotePriceInUsd quote token's price in usd
 */
function calculateInQuote(valueInUsd?: BigNumber.Value, quotePriceInUsd?: BigNumber.Value) {
  return valueInUsd !== undefined &&
    quotePriceInUsd !== undefined &&
    new BigNumber(quotePriceInUsd).gt(0)
    ? new BigNumber(valueInUsd).div(quotePriceInUsd).toString()
    : undefined;
}

/**
 * calculate price change ratio, (close - open) / open
 * @param open open price
 * @param close close price
 * @returns price change ratio
 */
function calculatePriceChangeRatio(open?: BigNumber.Value, close?: BigNumber.Value) {
  if (open === undefined || close === undefined) return undefined;
  const openBn = new BigNumber(open);
  const closeBn = new BigNumber(close);
  if (openBn.isNaN() || openBn.isZero() || closeBn.isNaN()) return undefined;
  return closeBn.minus(openBn).div(openBn).toString();
}

/**
 * convert stream token metadata to unified token
 * @param metadata token metadata data through stream subscription
 * @returns unified token metadata, if some value is not available, it will be set to undefined
 */
export function convertStreamRankingTokenMetadata(
  metadata: TokenMetadata,
): RecursivePartial<Token> {
  return {
    address: metadata.tokenAddress,
    symbol: metadata.symbol,
    decimals: metadata.decimals,
    name: metadata.name,
    description: metadata.description,
    imageUrl: metadata.imageUrl,
    socialMedias: metadata.socialMedia,
    tokenCreatedAt: metadata.createdAtMs,
    extra: {
      launchFromProtocolFamily: metadata.launchFrom?.protocolFamily,
      launchFromProgramAddress: metadata.launchFrom?.programAddress,
      migratedToProtocolFamily: metadata.migratedTo?.protocolFamily,
      migratedToProgramAddress: metadata.migratedTo?.programAddress,
    },
  };
}

export function convertStreamRankingTokenStat(stat: StreamTokenStat): RecursivePartial<Token> {
  return {
    address: stat.address,
    stats: {
      ...convertStreamRankingTokenStats("1m", stat),
      ...convertStreamRankingTokenStats("5m", stat),
      ...convertStreamRankingTokenStats("15m", stat),
      ...convertStreamRankingTokenStats("30m", stat),
      ...convertStreamRankingTokenStats("1h", stat),
      ...convertStreamRankingTokenStats("4h", stat),
      ...convertStreamRankingTokenStats("24h", stat),
    } as any,
  };
}

export function convertStreamRankingTokenLiquidity(
  liquidity: StreamTokenLiquidity,
): RecursivePartial<Token> {
  return {
    address: liquidity.tokenAddress,
    marketData: {
      totalTvlInUsd: liquidity.value,
    },
  };
}

export function convertStreamRankingTokenHolders(
  holders: StreamTokenHolder,
): RecursivePartial<Token> {
  return {
    address: holders.tokenAddress,
    marketData: {
      holders: holders.holders?.toString(),
      top10HoldingsRatio: holders.top10HoldersRatio,
      top100HoldingsRatio: holders.top100HoldersRatio,
    },
  };
}

export function convertStreamRankingTokenSupply(
  supply: StreamTokenSupply,
  quotePriceInUsd?: BigNumber.Value,
): RecursivePartial<Token> {
  return {
    address: supply.tokenAddress,
    marketData: {
      totalSupply: supply.supply,
      marketCapInUsd:
        quotePriceInUsd && supply.supply
          ? new BigNumber(quotePriceInUsd).times(supply.supply).toString()
          : undefined,
    },
  };
}

/**
 * convert streaming ranking token stats in timeframe to unified token stats
 * @param timeframe timeframe
 * @param stat stream token stat data through stream subscription
 * @returns unified token stats, if some value is not available, it will be set to undefined
 */
function convertStreamRankingTokenStats(timeframe: Timeframe, stat?: StreamTokenStat) {
  const priceInUsd = stat?.[`price${timeframe}`];
  const openPriceInUsd = stat?.[`openInUsd${timeframe}`];
  const closePriceInUsd = stat?.[`closeInUsd${timeframe}`];
  const buys = stat?.[`buys${timeframe}`];
  const sells = stat?.[`sells${timeframe}`];
  const buyers = stat?.[`buyers${timeframe}`];
  const sellers = stat?.[`sellers${timeframe}`];
  const buyVolumesInUsd = stat?.[`buyVolumeInUsd${timeframe}`];
  const sellVolumesInUsd = stat?.[`sellVolumeInUsd${timeframe}`];
  const buyVolumes = calculateInQuote(buyVolumesInUsd, priceInUsd);
  const sellVolumes = calculateInQuote(sellVolumesInUsd, priceInUsd);
  return {
    // trades
    [`buys${timeframe}`]: buys,
    [`sells${timeframe}`]: sells,
    [`trades${timeframe}`]:
      buys !== undefined && sells !== undefined
        ? new BigNumber(buys).plus(sells).toNumber()
        : undefined,

    // traders
    [`buyers${timeframe}`]: buyers,
    [`sellers${timeframe}`]: sellers,
    [`traders${timeframe}`]:
      buyers !== undefined && sellers !== undefined
        ? new BigNumber(buyers).plus(sellers).toNumber()
        : undefined,

    // volumes
    [`buyVolumesInUsd${timeframe}`]: buyVolumesInUsd,
    [`sellVolumesInUsd${timeframe}`]: sellVolumesInUsd,
    [`volumesInUsd${timeframe}`]:
      buyVolumesInUsd !== undefined && sellVolumesInUsd !== undefined
        ? new BigNumber(buyVolumesInUsd).plus(sellVolumesInUsd).toString()
        : undefined,
    [`buyVolumes${timeframe}`]: buyVolumes,
    [`sellsVolumes${timeframe}`]: sellVolumes,
    [`volumes${timeframe}`]:
      buyVolumes !== undefined && sellVolumes !== undefined
        ? new BigNumber(buyVolumes).plus(sellVolumes).toString()
        : undefined,

    // prices
    [`price${timeframe}`]: priceInUsd,
    [`openPriceInUsd${timeframe}`]: openPriceInUsd,
    [`closePriceInUsd${timeframe}`]: closePriceInUsd,
    [`priceChangeRatioInUsd${timeframe}`]: calculatePriceChangeRatio(
      openPriceInUsd,
      closePriceInUsd,
    ),
    // 'highInUsd1m'?: string;
    // 'lowInUsd1m'?: string;
  };
}

/**
 * convert stream ranking token data to unified token
 * @param chainId token's chain
 * @param rankingToken ranking token data through stream subscription
 * @param quotePriceInUsd quote token's price in usd, used to calculate market cap, price etc.
 * @returns unified token, if some value is not available, it will be set to undefined
 */
export function convertStreamRankingToken(
  chainId: CHAIN_ID,
  rankingToken: RankingTokenList,
  quotePriceInUsd: BigNumber.Value,
): RecursivePartial<Token> {
  return {
    // metadata properties
    chain: chainSlugs[chainId],
    address: rankingToken.metadata?.tokenAddress,
    symbol: rankingToken.metadata?.symbol,
    name: rankingToken.metadata?.name,
    description: rankingToken.metadata?.description,
    imageUrl: rankingToken.metadata?.imageUrl,
    decimals: rankingToken.metadata?.decimals,
    tokenCreatedAt: rankingToken.metadata?.createdAtMs,
    socialMedias: rankingToken.metadata?.socialMedia,

    // 'metadataAddress'?: string;
    // 'tokenCreators'?: TokenCreatorsDTO;
    // 'uri'?: string;
    // 'extra'?: TokenExtraDTO;
    // 'market'?: string;
    // 'deployer'?: string;
    // 'extension'?: any;
    // 'liquidity'?: Array<DexPoolDTO>;

    // market data properties
    marketData: {
      // supply
      totalSupply: rankingToken.supply?.supply,

      // market cap
      marketCapInUsd: rankingToken.supply?.marketCapInUsd,
      marketCapInSol: calculateInQuote(rankingToken.supply?.marketCapInUsd, quotePriceInUsd),

      // price
      priceInUsd: rankingToken.stat?.price,
      priceInSol: calculateInQuote(rankingToken.stat?.price, quotePriceInUsd),

      // holdings etc.
      holders: rankingToken.holder?.holders?.toString(),
      top10TotalHoldings: rankingToken.holder?.top100HoldersAmount,
      top10HoldingsRatio: rankingToken.holder?.top100HoldersRatio,
      top100TotalHoldings: rankingToken.holder?.top100HoldersAmount,
      top100HoldingsRatio: rankingToken.holder?.top100HoldersRatio,

      // 'completionRatio'?: string;
      // 'creatorsCount'?: number;
      // 'creatorHoldings'?: string;
      // 'creatorHoldingRatio'?: string;

      // 'tvlInSol'?: string;
      // 'tvlInUsd': string;
    },
    stats: {
      address: rankingToken.metadata?.tokenAddress ?? "",
      ...convertStreamRankingTokenStats("1m", rankingToken.stat),
      ...convertStreamRankingTokenStats("5m", rankingToken.stat),
      ...convertStreamRankingTokenStats("15m", rankingToken.stat),
      ...convertStreamRankingTokenStats("30m", rankingToken.stat),
      ...convertStreamRankingTokenStats("1h", rankingToken.stat),
      ...convertStreamRankingTokenStats("4h", rankingToken.stat),
      ...convertStreamRankingTokenStats("24h", rankingToken.stat),
    } as any,
  };
}

export function convertStreamNewToken(
  chainId: CHAIN_ID,
  newToken: NewToken,
): RecursivePartial<Token> {
  return {
    chain: chainSlugs[chainId],
    address: newToken.tokenAddress,
    symbol: newToken.symbol,
    name: newToken.name,
    decimals: newToken.decimals,
    tokenCreatedAt: newToken.createdAtMs,
    extra: {
      launchFromProgramAddress: newToken.launchFrom?.programAddress,
      launchFromProtocolFamily: newToken.launchFrom?.protocolFamily,
    },
  };
}
