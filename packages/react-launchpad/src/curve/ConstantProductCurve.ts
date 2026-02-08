import { BigNumber } from "bignumber.js";
import { LaunchPadPoolInfo, PoolBaseAmount } from "../types";
import { BaseCurve } from "./BaseCurve";

export class ConstantProductCurve extends BaseCurve {
  static getPoolInitPriceByPool({
    poolInfo,
    decimalA,
    decimalB,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    return new BigNumber(poolInfo.virtualB)
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
    return new BigNumber(b).div(a).times(10 ** (decimalA - decimalB));
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
    return new BigNumber(new BigNumber(poolInfo.virtualB).plus(poolInfo.realB))
      .div(new BigNumber(poolInfo.virtualA).minus(poolInfo.realA))
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
    return new BigNumber(new BigNumber(totalFundRaising).minus(migrateFee))
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

    return new BigNumber(
      new BigNumber(poolInfo.virtualB).plus(poolInfo.realB).plus(buyAllTokenUseB),
    )
      .div(new BigNumber(poolInfo.virtualA).minus(new BigNumber(poolInfo.realA).plus(allSellToken)))
      .times(10 ** (decimalA - decimalB));
  }

  static getInitParam({
    supply,
    totalFundRaising,
    totalSell,
    totalLockedAmount,
    migrateFee,
  }: {
    supply: BigNumber.Value;
    totalSell: BigNumber.Value;
    totalLockedAmount: BigNumber.Value;
    totalFundRaising: BigNumber.Value;
    migrateFee: BigNumber.Value;
  }): { a: BigNumber.Value; b: BigNumber.Value; c: BigNumber.Value } {
    if (new BigNumber(supply).lte(totalSell)) throw Error("supply need gt total sell");

    const supplyMinusSellLocked = new BigNumber(supply).minus(totalSell).minus(totalLockedAmount);
    if (supplyMinusSellLocked.lte(new BigNumber(0))) throw Error("supplyMinusSellLocked <= 0");

    const tfMinusMf = new BigNumber(totalFundRaising).minus(migrateFee);
    if (tfMinusMf.lte(0)) throw Error("tfMinusMf <= 0");

    const numerator = tfMinusMf.times(totalSell).times(totalSell).div(supplyMinusSellLocked);
    const denominator = tfMinusMf
      .times(totalSell)
      .div(supplyMinusSellLocked)
      .minus(totalFundRaising);

    if (denominator.lt(0)) throw Error("supply/totalSell/totalLockedAmount diff too high");

    const x0 = numerator.div(denominator);
    const y0 = new BigNumber(totalFundRaising).times(totalFundRaising).div(denominator);

    if (x0.lt(0) || y0.lt(0)) throw Error("invalid input 0");

    return {
      a: x0,
      b: y0,
      c: totalSell,
    };
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
      inputReserve: new BigNumber(poolInfo.virtualB).plus(poolInfo.realB),
      outputReserve: new BigNumber(poolInfo.virtualA).minus(poolInfo.realA),
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
      inputReserve: new BigNumber(poolInfo.virtualB).plus(poolInfo.realB),
      outputReserve: new BigNumber(poolInfo.virtualA).minus(poolInfo.realA),
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
      inputReserve: new BigNumber(poolInfo.virtualA).minus(poolInfo.realA),
      outputReserve: new BigNumber(poolInfo.virtualB).plus(poolInfo.realB),
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
      inputReserve: new BigNumber(poolInfo.virtualA).minus(poolInfo.realA),
      outputReserve: new BigNumber(poolInfo.virtualB).plus(poolInfo.realB),
    });
  }

  static getAmountOut({
    amountIn,
    inputReserve,
    outputReserve,
  }: {
    amountIn: BigNumber.Value;
    inputReserve: BigNumber.Value;
    outputReserve: BigNumber.Value;
  }): BigNumber.Value {
    const numerator = new BigNumber(amountIn).times(outputReserve);
    const denominator = new BigNumber(inputReserve).plus(amountIn);
    const amountOut = numerator.div(denominator);
    return amountOut;
  }

  static getAmountIn({
    amountOut,
    inputReserve,
    outputReserve,
  }: {
    amountOut: BigNumber.Value;
    inputReserve: BigNumber.Value;
    outputReserve: BigNumber.Value;
  }): BigNumber.Value {
    const numerator = new BigNumber(inputReserve).times(amountOut);
    const denominator = new BigNumber(outputReserve).minus(amountOut);
    const amountIn = numerator.div(denominator);
    return amountIn;
  }
}
