import { LaunchPadPoolInfo, PoolBaseAmount } from "../types";

export class BaseCurve {
  static getPoolInitPriceByPool(_: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    throw Error();
  }

  static getPoolInitPriceByInit(_: {
    a: BigNumber.Value;
    b: BigNumber.Value;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    throw Error();
  }

  static getPoolPrice(_: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    throw Error();
  }

  static getPoolEndPrice(_: {
    supply: BigNumber.Value;
    totalSell: BigNumber.Value;
    totalLockedAmount: BigNumber.Value;
    totalFundRaising: BigNumber.Value;
    migrateFee: BigNumber.Value;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    throw Error();
  }

  static getPoolEndPriceReal(_: {
    poolInfo: LaunchPadPoolInfo;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    throw Error();
  }

  static getInitParam(_: {
    supply: BigNumber.Value;
    totalSell: BigNumber.Value;
    totalLockedAmount: BigNumber.Value;
    totalFundRaising: BigNumber.Value;
    migrateFee: BigNumber.Value;
  }): { a: BigNumber.Value; b: BigNumber.Value; c: BigNumber.Value } {
    throw Error();
  }

  static buyExactIn(_: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    amount: BigNumber.Value;
  }): BigNumber.Value {
    throw Error();
  }

  static buyExactOut(_: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    amount: BigNumber.Value;
  }): BigNumber.Value {
    throw Error();
  }

  static sellExactIn(_: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    amount: BigNumber.Value;
  }): BigNumber.Value {
    throw Error();
  }

  static sellExactOut(_: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    amount: BigNumber.Value;
  }): BigNumber.Value {
    throw Error();
  }
}
