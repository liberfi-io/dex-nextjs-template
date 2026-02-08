import { BigNumber } from "bignumber.js";
import { CreateTokenInput } from "@chainstream-io/sdk";
import { CHAIN_ID } from "@liberfi/core";

export enum LaunchPadPlatform {
  PUMPFUN = "pumpfun",
  RAYDIUM = "raydium",
}

export enum CurveType {
  CONSTANT_PRODUCT = "constant_product",
  FIXED_PRICE = "fixed_price",
  LINEAR_PRICE = "linear_price",
}

export interface LaunchpadVestingSchedule {
  totalLockedAmount: BigNumber.Value;
  totalAllocatedShare: BigNumber.Value;
  cliffPeriod: number;
  unlockPeriod: number;
  startTime: number;
}

export interface LaunchPadPoolInfo {
  platform: LaunchPadPlatform;
  creator: string;
  mintA: string;
  mintB: string;
  mintDecimalsA: number;
  mintDecimalsB: number;
  vaultA: string;
  vaultB: string;
  supply: BigNumber.Value;
  totalSellA: BigNumber.Value;
  totalFundRaisingB: BigNumber.Value;
  virtualA: BigNumber.Value;
  virtualB: BigNumber.Value;
  realA: BigNumber.Value;
  realB: BigNumber.Value;
  protocolFee: BigNumber.Value;
  platformFee: BigNumber.Value;
  migrateFee: BigNumber.Value;
  vestingSchedule: LaunchpadVestingSchedule;
}

export interface PoolBaseAmount {
  virtualA: BigNumber.Value;
  virtualB: BigNumber.Value;
  realA: BigNumber.Value;
  realB: BigNumber.Value;
}

export interface PoolCurvePoint {
  price: BigNumber.Value;
  totalSellSupply: BigNumber.Value;
}

export interface LaunchPadConfigInfo {
  decimals: number;
  minSupplyA: number;
  minSellRateA: number;
  minFundRaisingB: number;
  minMigrateRateA: number;
  maxLockRate: number;
}

export type CreateTokenParams = {
  chain: CHAIN_ID;
} & CreateTokenInput;
