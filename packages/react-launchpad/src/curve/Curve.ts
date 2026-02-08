import BigNumber from "bignumber.js";
import {
  CurveType,
  LaunchPadConfigInfo,
  LaunchPadPoolInfo,
  PoolBaseAmount,
  PoolCurvePoint,
} from "../types";
import { BaseCurve } from "./BaseCurve";
import { ConstantProductCurve } from "./ConstantProductCurve";
import { FixedPriceCurve } from "./FixedPriceCurve";
import { LinearPriceCurve } from "./LinearPriceCurve";

export class Curve {
  static getCurvePreviewPoints({
    curveType,
    pointCount,
    poolInfo,
  }: {
    curveType: CurveType;
    poolInfo: LaunchPadPoolInfo;
    pointCount: number;
  }): PoolCurvePoint[] {
    return this.getPoolCurvePointByInit({
      curveType,
      pointCount,
      supply: poolInfo.supply,
      totalFundRaising: poolInfo.totalFundRaisingB,
      totalSell: poolInfo.totalSellA,
      totalLockedAmount: poolInfo.vestingSchedule.totalLockedAmount,
      migrateFee: poolInfo.migrateFee,
      decimalA: poolInfo.mintDecimalsA,
      decimalB: poolInfo.mintDecimalsB,
    });
  }

  static getPoolCurvePointByInit({
    curveType,
    pointCount,
    supply,
    totalFundRaising,
    totalSell,
    totalLockedAmount,
    migrateFee,
    decimalA,
    decimalB,
  }: {
    curveType: CurveType;
    supply: BigNumber.Value;
    totalSell: BigNumber.Value;
    totalLockedAmount: BigNumber.Value;
    totalFundRaising: BigNumber.Value;
    migrateFee: BigNumber.Value;
    decimalA: number;
    decimalB: number;
    pointCount: number;
  }): PoolCurvePoint[] {
    if (pointCount < 3) throw Error("point count < 3");

    const curve = this.getCurve(curveType);

    const { a, b } = curve.getInitParam({
      supply,
      totalFundRaising,
      totalSell,
      totalLockedAmount,
      migrateFee,
    });

    const initPrice = curve.getPoolInitPriceByInit({ a, b, decimalA, decimalB });

    const stepBuy = new BigNumber(totalFundRaising).div(pointCount - 1);

    const zero = new BigNumber(0);

    const returnPoints: PoolCurvePoint[] = [{ price: initPrice, totalSellSupply: 0 }];

    let realA = zero;
    let realB = zero;

    for (let i = 1; i < pointCount; i++) {
      const amountB = i !== pointCount - 1 ? stepBuy : new BigNumber(totalFundRaising).minus(realB);

      const itemBuy = this.buyExactIn({
        poolInfo: {
          virtualA: a,
          virtualB: b,
          realA,
          realB,
          totalFundRaisingB: totalFundRaising,
          totalSellA: totalSell,
        },
        amountB,
        protocolFeeRate: zero,
        platformFeeRate: zero,
        curveType,
        shareFeeRate: zero,
      });

      realA = realA.plus(itemBuy.amountA);
      realB = realB.plus(itemBuy.amountB);

      const nowPoolPrice = this.getPrice({
        poolInfo: { virtualA: a, virtualB: b, realA, realB },
        decimalA,
        decimalB,
        curveType,
      });

      returnPoints.push({
        price: nowPoolPrice,
        totalSellSupply: new BigNumber(realA).div(10 ** decimalA).toNumber(),
      });
    }

    return returnPoints;
  }

  static getPoolInitPriceByPool({
    poolInfo,
    decimalA,
    decimalB,
    curveType,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    decimalA: number;
    decimalB: number;
    curveType: CurveType;
  }): BigNumber.Value {
    const curve = this.getCurve(curveType);
    return curve.getPoolInitPriceByPool({ poolInfo, decimalA, decimalB });
  }

  static getPoolInitPriceByInit({
    a,
    b,
    decimalA,
    decimalB,
    curveType,
  }: {
    a: BigNumber.Value;
    b: BigNumber.Value;
    decimalA: number;
    decimalB: number;
    curveType: CurveType;
  }): BigNumber.Value {
    const curve = this.getCurve(curveType);
    return curve.getPoolInitPriceByInit({ a, b, decimalA, decimalB });
  }

  static getPrice({
    poolInfo,
    curveType,
    decimalA,
    decimalB,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    curveType: CurveType;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    const curve = this.getCurve(curveType);
    return curve.getPoolPrice({ poolInfo, decimalA, decimalB });
  }

  static getEndPrice({
    poolInfo,
    curveType,
    decimalA,
    decimalB,
  }: {
    poolInfo: LaunchPadPoolInfo;
    curveType: CurveType;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    const curve = this.getCurve(curveType);
    return curve.getPoolPrice({ poolInfo, decimalA, decimalB });
  }

  static getPoolEndPriceReal({
    poolInfo,
    curveType,
    decimalA,
    decimalB,
  }: {
    poolInfo: LaunchPadPoolInfo;
    curveType: CurveType;
    decimalA: number;
    decimalB: number;
  }): BigNumber.Value {
    const curve = this.getCurve(curveType);
    return curve.getPoolEndPriceReal({ poolInfo, decimalA, decimalB });
  }

  static checkParam({
    supply,
    totalFundRaising,
    totalSell,
    totalLockedAmount,
    decimalsA,
    decimalsB,
    config,
    migrateType,
  }: {
    supply: BigNumber.Value;
    totalSell: BigNumber.Value;
    totalLockedAmount: BigNumber.Value;
    totalFundRaising: BigNumber.Value;
    decimalsA: number;
    decimalsB: number;
    config: LaunchPadConfigInfo;
    migrateType: "amm" | "cpmm";
  }) {
    const supplyBn = new BigNumber(supply);

    if (decimalsA !== config.decimals) throw Error(`decimals should be ${config.decimals}`);

    if (supplyBn.times(config.maxLockRate).lt(totalLockedAmount))
      throw Error("totalLockedAmount exceeds max lock amount");

    if (new BigNumber(config.minSupplyA).shiftedBy(decimalsA).gte(supply))
      throw Error("supply less than min supply");

    if (supplyBn.times(config.minSellRateA).gte(totalSell))
      throw Error("totalSell less than min sell");

    if (new BigNumber(config.minFundRaisingB).shiftedBy(decimalsB).gte(totalFundRaising))
      throw Error("totalFundRaising less than min fund raising");

    const migrateAmountBn = supplyBn.minus(totalSell).minus(totalLockedAmount);

    if (migrateAmountBn.lt(supplyBn.times(config.minMigrateRateA)))
      throw Error("migrateAmount less than min migrate amount");

    const liquidity = migrateAmountBn.times(totalFundRaising).sqrt();

    if (migrateType === "amm") {
      if (liquidity.shiftedBy(-decimalsA).lte(1)) throw Error("insufficient liquidity");
    } else if (migrateType === "cpmm") {
      if (liquidity.lte(100)) throw Error("insufficient liquidity");
    } else {
      throw Error("invalid migrateType");
    }
  }

  static buyExactIn({
    poolInfo,
    amountB,
    protocolFeeRate,
    platformFeeRate,
    curveType,
    shareFeeRate,
  }: {
    poolInfo:
      | LaunchPadPoolInfo
      | (PoolBaseAmount & { totalSellA: BigNumber.Value; totalFundRaisingB: BigNumber.Value });
    amountB: BigNumber.Value;
    protocolFeeRate: BigNumber.Value;
    platformFeeRate: BigNumber.Value;
    curveType: CurveType;
    shareFeeRate: BigNumber.Value;
  }): {
    amountA: BigNumber.Value;
    amountB: BigNumber.Value;
    splitFee: {
      platformFee: BigNumber.Value;
      shareFee: BigNumber.Value;
      protocolFee: BigNumber.Value;
    };
  } {
    const feeRate = new BigNumber(protocolFeeRate).plus(shareFeeRate).plus(platformFeeRate);
    const _totalFee = this.calculateFee({ amount: amountB, feeRate });

    const amountLessFeeB = new BigNumber(amountB).minus(_totalFee);

    const curve = this.getCurve(curveType);

    const _amountA = curve.buyExactIn({ poolInfo, amount: amountLessFeeB });

    const remainingAmountA = new BigNumber(poolInfo.totalSellA).minus(poolInfo.realA);

    let amountA: BigNumber.Value;
    let realAmountB: BigNumber.Value;
    let totalFee: BigNumber.Value;

    if (remainingAmountA.lte(_amountA)) {
      amountA = remainingAmountA;
      const amountLessFeeB = curve.buyExactOut({
        poolInfo,
        amount: amountA,
      });

      realAmountB = this.calculatePreFee({ postFeeAmount: amountLessFeeB, feeRate });
      totalFee = new BigNumber(realAmountB).minus(amountLessFeeB);
    } else {
      amountA = _amountA;
      realAmountB = amountB;
      totalFee = _totalFee;
    }

    const splitFee = this.splitFee({ totalFee, protocolFeeRate, platformFeeRate, shareFeeRate });

    return { amountA, amountB: realAmountB, splitFee };
  }

  static buyExactOut({
    poolInfo,
    amountA,
    protocolFeeRate,
    platformFeeRate,
    curveType,
    shareFeeRate,
  }: {
    poolInfo:
      | LaunchPadPoolInfo
      | (PoolBaseAmount & { totalSellA: BigNumber.Value; totalFundRaisingB: BigNumber.Value });
    amountA: BigNumber.Value;
    protocolFeeRate: BigNumber.Value;
    platformFeeRate: BigNumber.Value;
    curveType: CurveType;
    shareFeeRate: BigNumber.Value;
  }): {
    amountA: BigNumber.Value;
    amountB: BigNumber.Value;
    splitFee: {
      platformFee: BigNumber.Value;
      shareFee: BigNumber.Value;
      protocolFee: BigNumber.Value;
    };
  } {
    const remainingAmountA = new BigNumber(poolInfo.totalSellA).minus(poolInfo.realA);

    let realAmountA = amountA;
    if (remainingAmountA.lte(amountA)) {
      realAmountA = remainingAmountA;
    }

    const curve = this.getCurve(curveType);
    const amountInLessFeeB = curve.buyExactOut({ poolInfo, amount: amountA });

    const totalFeeRate = new BigNumber(protocolFeeRate).plus(shareFeeRate).plus(platformFeeRate);
    const amountB = this.calculatePreFee({
      postFeeAmount: amountInLessFeeB,
      feeRate: totalFeeRate,
    });
    const totalFee = new BigNumber(amountB).minus(amountInLessFeeB);

    const splitFee = this.splitFee({ totalFee, protocolFeeRate, platformFeeRate, shareFeeRate });

    return { amountA: realAmountA, amountB, splitFee };
  }

  static sellExactIn({
    poolInfo,
    amountA,
    protocolFeeRate,
    platformFeeRate,
    curveType,
    shareFeeRate,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    amountA: BigNumber.Value;
    protocolFeeRate: BigNumber.Value;
    platformFeeRate: BigNumber.Value;
    curveType: CurveType;
    shareFeeRate: BigNumber.Value;
  }): {
    amountA: BigNumber.Value;
    amountB: BigNumber.Value;
    splitFee: {
      platformFee: BigNumber.Value;
      shareFee: BigNumber.Value;
      protocolFee: BigNumber.Value;
    };
  } {
    const curve = this.getCurve(curveType);

    const amountB = curve.sellExactIn({ poolInfo, amount: amountA });

    const totalFee = this.calculateFee({
      amount: amountB,
      feeRate: new BigNumber(protocolFeeRate).plus(shareFeeRate).plus(platformFeeRate),
    });
    const splitFee = this.splitFee({ totalFee, protocolFeeRate, platformFeeRate, shareFeeRate });

    return { amountA, amountB: new BigNumber(amountB).minus(totalFee), splitFee };
  }

  static sellExactOut({
    poolInfo,
    amountB,
    protocolFeeRate,
    platformFeeRate,
    curveType,
    shareFeeRate,
  }: {
    poolInfo: LaunchPadPoolInfo | PoolBaseAmount;
    amountB: BigNumber.Value;
    protocolFeeRate: BigNumber.Value;
    platformFeeRate: BigNumber.Value;
    curveType: CurveType;
    shareFeeRate: BigNumber.Value;
  }): {
    amountA: BigNumber.Value;
    amountB: BigNumber.Value;
    splitFee: {
      platformFee: BigNumber.Value;
      shareFee: BigNumber.Value;
      protocolFee: BigNumber.Value;
    };
  } {
    const totalFeeRate = new BigNumber(protocolFeeRate).plus(shareFeeRate).plus(platformFeeRate);

    const amountOutWithFeeB = this.calculatePreFee({
      postFeeAmount: amountB,
      feeRate: totalFeeRate,
    });

    if (new BigNumber(poolInfo.realB).lt(amountOutWithFeeB)) throw Error("Insufficient liquidity");

    const totalFee = new BigNumber(amountOutWithFeeB).minus(amountB);

    const curve = Curve.getCurve(curveType);
    const amountA = curve.sellExactOut({ poolInfo, amount: amountOutWithFeeB });

    if (new BigNumber(amountA).gt(poolInfo.realA)) throw Error("Insufficient liquidity");

    const splitFee = this.splitFee({ totalFee, protocolFeeRate, platformFeeRate, shareFeeRate });

    return { amountA, amountB, splitFee };
  }

  static splitFee({
    totalFee,
    protocolFeeRate,
    platformFeeRate,
    shareFeeRate,
  }: {
    totalFee: BigNumber.Value;
    protocolFeeRate: BigNumber.Value;
    platformFeeRate: BigNumber.Value;
    shareFeeRate: BigNumber.Value;
  }): { platformFee: BigNumber.Value; shareFee: BigNumber.Value; protocolFee: BigNumber.Value } {
    const totalFeeBn = new BigNumber(totalFee);
    const totalFeeRate = new BigNumber(protocolFeeRate).plus(platformFeeRate).plus(shareFeeRate);
    const platformFee = totalFeeRate.isZero()
      ? new BigNumber(0)
      : totalFeeBn.times(platformFeeRate).div(totalFeeRate);
    const shareFee = totalFeeRate.isZero()
      ? new BigNumber(0)
      : totalFeeBn.times(shareFeeRate).div(totalFeeRate);
    const protocolFee = totalFeeBn.minus(platformFee).minus(shareFee);
    return { platformFee, shareFee, protocolFee };
  }

  static calculateFee({
    amount,
    feeRate,
  }: {
    amount: BigNumber.Value;
    feeRate: BigNumber.Value;
  }): BigNumber.Value {
    return new BigNumber(amount).times(feeRate);
  }

  static calculatePreFee({
    postFeeAmount,
    feeRate,
  }: {
    postFeeAmount: BigNumber.Value;
    feeRate: BigNumber.Value;
  }): BigNumber.Value {
    if (new BigNumber(feeRate).isZero()) return postFeeAmount;
    return new BigNumber(postFeeAmount).div(new BigNumber(feeRate).plus(1));
  }

  static getCurve(curveType: CurveType): typeof BaseCurve {
    switch (curveType) {
      case CurveType.CONSTANT_PRODUCT:
        return ConstantProductCurve;
      case CurveType.FIXED_PRICE:
        return FixedPriceCurve;
      case CurveType.LINEAR_PRICE:
        return LinearPriceCurve;
    }
  }
}
