import { LaunchPadPoolInfo, PoolBaseAmount } from "../types";
import { BaseCurve } from "./BaseCurve";

export class FixedPriceCurve extends BaseCurve {
  static getPoolInitPriceByPool({
    poolInfo,
    decimalA,
    decimalB,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    return BigNumber(poolInfo.virtualB)
      .div(poolInfo.virtualA)
      .times(10 ** (decimalA - decimalB));
  }

  static getPoolInitPriceByInit({
    a,
    b,
    decimalA,
    decimalB,
  }: {
    a: BigNumber.Value;
    b: BigNumber.Value;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    return BigNumber(b)
      .div(a)
      .times(10 ** (decimalA - decimalB));
  }

  static getPoolPrice({
    poolInfo,
    decimalA,
    decimalB,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    return BigNumber(poolInfo.virtualB)
      .div(poolInfo.virtualA)
      .times(10 ** (decimalA - decimalB));
  }

  static getPoolEndPrice({
    supply,
    totalSell,
    totalLockedAmount,
    totalFundRaising,
    migrateFee,
    decimalA,
    decimalB,
  }: {
    supply: BigNumber.Value;
    totalSell: BigNumber.Value;
    totalLockedAmount: BigNumber.Value;
    totalFundRaising: BigNumber.Value;
    migrateFee: BigNumber.Value;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    return BigNumber(totalFundRaising)
      .minus(migrateFee)
      .div(BigNumber(supply).minus(totalSell).minus(totalLockedAmount))
      .times(10 ** (decimalA - decimalB));
  }

  static getPoolEndPriceReal({
    poolInfo,
    decimalA,
    decimalB,
  }: {
    poolInfo: LaunchPadPoolInfo;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    const allSellToken = BigNumber(poolInfo.totalSellA).minus(poolInfo.realA);
    const buyAllTokenUseB = BigNumber(poolInfo.totalFundRaisingB).minus(poolInfo.realB);

    return BigNumber(poolInfo.virtualB)
      .plus(poolInfo.realB)
      .plus(buyAllTokenUseB)
      .div(BigNumber(poolInfo.virtualA).minus(poolInfo.realA).plus(allSellToken))
      .times(10 ** (decimalA - decimalB));
  }

  static getInitParam({
    supply,
    totalFundRaising,
    totalLockedAmount,
    migrateFee,
  }: {
    supply: BigNumber.Value;
    totalSell: BigNumber.Value;
    totalFundRaising: BigNumber.Value;
    totalLockedAmount: BigNumber.Value;
    migrateFee: BigNumber.Value;
  }): { a: BigNumber.Value; b: BigNumber.Value; c: BigNumber.Value } {
    const supplyMinusLocked = BigNumber(supply).minus(totalLockedAmount);

    if (supplyMinusLocked.lte(0)) throw Error("invalid input 1");

    const denominator = BigNumber(2).times(totalFundRaising).minus(migrateFee);
    const numerator = BigNumber(totalFundRaising).times(supplyMinusLocked);
    const totalSellExpect = numerator.div(denominator);

    return { a: totalSellExpect, b: totalFundRaising, c: totalSellExpect };
  }

  static buyExactIn({
    poolInfo,
    amount,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    amount: BigNumber.Value;
  }): BigNumber.Value {
    return this.getAmountOut({
      amountIn: amount,
      initInput: poolInfo.virtualB,
      initOutput: poolInfo.virtualA,
    });
  }

  static buyExactOut({
    poolInfo,
    amount,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    amount: BigNumber.Value;
  }): BigNumber.Value {
    return this.getAmountIn({
      amountOut: amount,
      initInput: poolInfo.virtualB,
      initOutput: poolInfo.virtualA,
    });
  }

  static sellExactIn({
    poolInfo,
    amount,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    amount: BigNumber.Value;
  }): BigNumber.Value {
    return this.getAmountOut({
      amountIn: amount,
      initInput: poolInfo.virtualA,
      initOutput: poolInfo.virtualB,
    });
  }

  static sellExactOut({
    poolInfo,
    amount,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    amount: BigNumber.Value;
  }): BigNumber.Value {
    return this.getAmountIn({
      amountOut: amount,
      initInput: poolInfo.virtualA,
      initOutput: poolInfo.virtualB,
    });
  }

  static getAmountOut({
    amountIn,
    initInput,
    initOutput,
  }: {
    amountIn: BigNumber.Value;
    initInput: BigNumber.Value;
    initOutput: BigNumber.Value;
  }): BigNumber.Value {
    const numerator = new BigNumber(initOutput).times(amountIn);
    const amountOut = numerator.div(initInput);
    return amountOut;
  }

  static getAmountIn({
    amountOut,
    initInput,
    initOutput,
  }: {
    amountOut: BigNumber.Value;
    initInput: BigNumber.Value;
    initOutput: BigNumber.Value;
  }): BigNumber.Value {
    const numerator = new BigNumber(initInput).times(amountOut);
    const amountIn = numerator.div(initOutput);
    return amountIn;
  }
}
