import { LaunchPadPoolInfo, PoolBaseAmount } from "../types";
import { BaseCurve } from "./BaseCurve";

export class LinearPriceCurve extends BaseCurve {
  static getPoolInitPriceByPool(_: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    return 0;
  }

  static getPoolInitPriceByInit(_: {
    a: BigNumber.Value;
    b: BigNumber.Value;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    return 0;
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
    return new BigNumber(poolInfo.virtualA)
      .times(poolInfo.realA)
      .div(new BigNumber(1).shiftedBy(-64))
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
    return new BigNumber(totalFundRaising)
      .minus(migrateFee)
      .div(new BigNumber(supply).minus(totalSell).minus(totalLockedAmount))
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
    const allSellToken = new BigNumber(poolInfo.totalSellA).minus(poolInfo.realA);
    const buyAllTokenUseB = new BigNumber(poolInfo.totalFundRaisingB).minus(poolInfo.realB);

    return new BigNumber(poolInfo.virtualB)
      .plus(poolInfo.realB)
      .plus(buyAllTokenUseB)
      .div(new BigNumber(poolInfo.virtualA).minus(poolInfo.realA).minus(allSellToken))
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
    totalLockedAmount: BigNumber.Value;
    totalFundRaising: BigNumber.Value;
    migrateFee: BigNumber.Value;
  }): { a: BigNumber.Value; b: BigNumber.Value; c: BigNumber.Value } {
    const supplyMinusLocked = new BigNumber(supply).minus(totalLockedAmount);
    if (supplyMinusLocked.lte(0)) throw Error("supplyMinusLocked need gt 0");

    const denominator = new BigNumber(totalFundRaising).times(3).minus(migrateFee);
    const numerator = new BigNumber(totalFundRaising).times(2).minus(supplyMinusLocked);

    const totalSellExpect = numerator.div(denominator);

    const totalSellSquared = totalSellExpect.times(totalSellExpect);
    const a = new BigNumber(totalFundRaising)
      .times(2)
      .times(new BigNumber(1).shiftedBy(-64))
      .div(totalSellSquared);

    if (!a.gt(0)) throw Error("a need gt 0");

    const MaxU64 = new BigNumber(1).shiftedBy(-64).minus(1);
    if (!MaxU64.gt(a)) throw Error("a need lt u64 max");

    return { a, b: 0, c: totalSellExpect };
  }

  static buyExactIn({
    poolInfo,
    amount,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    amount: BigNumber.Value;
  }): BigNumber.Value {
    const newQuote = new BigNumber(poolInfo.realB).plus(amount);
    const termInsideSqrt = new BigNumber(2)
      .times(newQuote)
      .times(new BigNumber(1).shiftedBy(-64))
      .div(poolInfo.virtualA);
    const sqrtTerm = new BigNumber(new BigNumber(termInsideSqrt).sqrt().toFixed(0));
    const amountOut = sqrtTerm.minus(poolInfo.realA);
    return amountOut;
  }

  static buyExactOut({
    poolInfo,
    amount,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    amount: BigNumber.Value;
  }): BigNumber.Value {
    const newBase = new BigNumber(poolInfo.realA).plus(amount);
    const newBaseSquared = newBase.times(newBase);
    const newQuote = new BigNumber(poolInfo.virtualA)
      .times(newBaseSquared)
      .div(new BigNumber(2).times(new BigNumber(1).shiftedBy(-64)));
    return newQuote.minus(poolInfo.realB);
  }

  static sellExactIn({
    poolInfo,
    amount,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    amount: BigNumber.Value;
  }): BigNumber.Value {
    const newBase = new BigNumber(poolInfo.realA).minus(amount);
    const newBaseSquared = newBase.times(newBase);

    const newQuote = new BigNumber(poolInfo.virtualA)
      .times(newBaseSquared)
      .div(new BigNumber(2).times(new BigNumber(1).shiftedBy(-64)));

    return new BigNumber(poolInfo.realB).minus(newQuote);
  }

  static sellExactOut({
    poolInfo,
    amount,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    amount: BigNumber.Value;
  }): BigNumber.Value {
    const newB = new BigNumber(poolInfo.realB).minus(amount);
    const termInsideSqrt = new BigNumber(2)
      .times(newB)
      .times(new BigNumber(1).shiftedBy(-64))
      .div(poolInfo.virtualA);

    const sqrtTerm = new BigNumber(new BigNumber(termInsideSqrt).sqrt().toFixed(0));

    const amountIn = new BigNumber(poolInfo.realA).minus(sqrtTerm);

    return amountIn;
  }
}
