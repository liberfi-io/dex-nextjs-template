import BigNumber from "bignumber.js";

export class SafeBigNumber extends BigNumber {
  constructor(num: BigNumber.Value, base?: number) {
    try {
      super(num, base);
    } catch (e) {
      console.error("SafeBigNumber constructor error", e);
      super(0, base);
    }
  }
}

export const isValidNumber = (num: unknown) => {
  if (
    ("number" === typeof num && !isNaN(num)) ||
    num instanceof SafeBigNumber ||
    num instanceof BigNumber
  ) {
    return true;
  }
  if ("string" !== typeof num) {
    return false;
  }
  const floatNum = Number.parseFloat(num);
  return !isNaN(floatNum);
};

export const canConvertToNumber = (num: unknown) =>
  ("number" === typeof num || !!num) && isValidNumber("string" === typeof num ? Number(num) : num);

export const isValidTimeframe = (timeframe: string = "") =>
  /^(\d+\.?\d*|\.\d+)([hm]?)$$/.test(timeframe);

export type FormatAmountOptions = {
  showPlusGtThanZero: boolean;
};

export const formatAmount = (
  num: BigNumber.Value,
  options: FormatAmountOptions = { showPlusGtThanZero: false },
) => {
  if (!isValidNumber(num)) return "--";

  const bn = new SafeBigNumber(num);
  const negative = bn.lt(0);
  const abs = bn.abs();

  const formatted = abs.lt(0.001)
    ? abs.decimalPlaces(5, BigNumber.ROUND_DOWN).toString()
    : abs.lt(1)
    ? abs.decimalPlaces(3, BigNumber.ROUND_DOWN).toString()
    : abs.lt(100)
    ? abs.decimalPlaces(2, BigNumber.ROUND_DOWN).toString()
    : abs.lt(1e5)
    ? stringifyNumberWithGroupingSeparator(abs, 2)
    : stringifyNumberWithAbbreviation(abs);

  if (Number(formatted) === 0) return `${formatted}`;
  if (negative) return `-${formatted}`;
  if (!options?.showPlusGtThanZero) return `${formatted}`;
  return `+${formatted}`;
};

export const formatAmount2 = (
  num: BigNumber.Value,
  options: FormatAmountOptions = { showPlusGtThanZero: false },
) => {
  if (!isValidNumber(num)) return "--";

  const bn = new SafeBigNumber(num);
  const negative = bn.lt(0);
  const abs = bn.abs();

  const formatted = abs.lt(0.001)
    ? abs.decimalPlaces(5, BigNumber.ROUND_DOWN).toString()
    : abs.lt(1)
    ? abs.decimalPlaces(3, BigNumber.ROUND_DOWN).toString()
    : abs.lt(100)
    ? abs.decimalPlaces(1, BigNumber.ROUND_DOWN).toString()
    : abs.lt(1e3)
    ? stringifyNumberWithGroupingSeparator(abs, 1)
    : stringifyNumberWithAbbreviation(abs);

  if (Number(formatted) === 0) return `${formatted}`;
  if (negative) return `-${formatted}`;
  if (!options?.showPlusGtThanZero) return `${formatted}`;
  return `+${formatted}`;
};

export const formatAmount3 = (
  num: BigNumber.Value,
  options: FormatAmountOptions = { showPlusGtThanZero: false },
) => {
  if (!isValidNumber(num)) return "--";

  const bn = new SafeBigNumber(num);
  const negative = bn.lt(0);
  const abs = bn.abs();

  const formatted = abs.lt(0.001)
    ? abs.decimalPlaces(5, BigNumber.ROUND_DOWN).toString()
    : abs.lt(1)
    ? abs.decimalPlaces(3, BigNumber.ROUND_DOWN).toString()
    : abs.lt(100)
    ? abs.decimalPlaces(1, BigNumber.ROUND_DOWN).toString()
    : abs.lt(1e3)
    ? stringifyNumberWithGroupingSeparator(abs, 1)
    : stringifyNumberWithAbbreviation(abs, 0);

  if (Number(formatted) === 0) return `${formatted}`;
  if (negative) return `-${formatted}`;
  if (!options?.showPlusGtThanZero) return `${formatted}`;
  return `+${formatted}`;
};

export const formatAmountUSD = (
  num: BigNumber.Value,
  options: FormatAmountOptions = { showPlusGtThanZero: false },
) => {
  if (!isValidNumber(num)) return "--";

  const bn = new SafeBigNumber(num);
  const negative = bn.lt(0);
  const abs = bn.abs();

  const formatted = abs.lt(0.001)
    ? "$0"
    : abs.lt(1)
    ? `$${abs.decimalPlaces(3, BigNumber.ROUND_DOWN)}`
    : abs.lt(100)
    ? `$${abs.decimalPlaces(2, BigNumber.ROUND_DOWN)}`
    : abs.lt(1e4)
    ? `$${stringifyNumberWithGroupingSeparator(abs, 2)}`
    : `$${stringifyNumberWithAbbreviation(abs)}`;

  if ("$0" === formatted) return formatted;
  if (negative) return `-${formatted}`;
  if (!options?.showPlusGtThanZero) return formatted;
  return `+${formatted}`;
};

export const formatAmountUSD2 = (
  num: BigNumber.Value,
  options: FormatAmountOptions = { showPlusGtThanZero: false },
) => {
  if (!isValidNumber(num)) return "--";

  const bn = new SafeBigNumber(num);
  const negative = bn.lt(0);
  const abs = bn.abs();
  const roundedAbs = abs.div(100).integerValue(BigNumber.ROUND_DOWN).times(100);

  const formatted =
    abs.lt(1e-4) || abs.lt(0.001)
      ? "$0"
      : abs.lt(1)
      ? `$${abs.decimalPlaces(3, BigNumber.ROUND_DOWN)}`
      : abs.lt(100)
      ? `$${abs.decimalPlaces(2, BigNumber.ROUND_DOWN)}`
      : abs.lt(1e3)
      ? `$${abs.decimalPlaces(1, BigNumber.ROUND_DOWN)}`
      : abs.lt(1e15)
      ? `$${stringifyNumberWithAbbreviation(roundedAbs)}`
      : `$${stringifyAmount(abs, {
          acronymMin: 1e5,
          groupingSeparator: true,
        })}`;

  if ("$0" === formatted) return formatted;
  if (negative) return `-${formatted}`;
  if (!options?.showPlusGtThanZero) return formatted;
  return `+${formatted}`;
};

export const formatAmountUSD3 = (
  num: BigNumber.Value,
  options: FormatAmountOptions = { showPlusGtThanZero: false },
) => {
  if (!isValidNumber(num)) return "--";

  const bn = new SafeBigNumber(num);
  const negative = bn.lt(0);
  const abs = bn.abs();
  const roundedAbs = abs.div(100).integerValue(BigNumber.ROUND_DOWN).times(100);

  const formatted =
    abs.lt(1e-4) || abs.lt(0.001)
      ? "$0"
      : abs.lt(1)
      ? `$${abs.decimalPlaces(3, BigNumber.ROUND_DOWN)}`
      : abs.lt(100)
      ? `$${abs.decimalPlaces(2, BigNumber.ROUND_DOWN)}`
      : abs.lt(1e3)
      ? `$${abs.decimalPlaces(0, BigNumber.ROUND_DOWN)}`
      : `$${stringifyNumberWithAbbreviation(roundedAbs, 0)}`;

  if ("$0" === formatted) return formatted;
  if (negative) return `-${formatted}`;
  if (!options?.showPlusGtThanZero) return formatted;
  return `+${formatted}`;
};

export const formatAmountUSD4 = (
  num: BigNumber.Value,
  options: FormatAmountOptions = { showPlusGtThanZero: false },
) => {
  if (!isValidNumber(num)) return "--";

  const bn = new SafeBigNumber(num);
  const negative = bn.lt(0);
  const abs = bn.abs();

  const formatted =
    abs.lt(1e-4) || abs.lt(0.001)
      ? "$0"
      : abs.lt(1)
      ? `$${abs.decimalPlaces(3, BigNumber.ROUND_DOWN)}`
      : abs.lt(100)
      ? `$${abs.decimalPlaces(2, BigNumber.ROUND_DOWN)}`
      : abs.lt(1e3)
      ? `$${stringifyNumberWithGroupingSeparator(abs, 2)}`
      : `$${stringifyNumberWithAbbreviation(abs)}`;

  if ("$0" === formatted) return formatted;
  if (negative) return `-${formatted}`;
  if (!options?.showPlusGtThanZero) return formatted;
  return `+${formatted}`;
};

export const formatAmountUSD5 = (
  num: BigNumber.Value,
  options: FormatAmountOptions = { showPlusGtThanZero: false },
) => {
  if (!isValidNumber(num)) return "--";

  const bn = new SafeBigNumber(num);
  const negative = bn.lt(0);
  const abs = bn.abs();

  const formatted =
    abs.lt(1e-4) || abs.lt(0.001)
      ? "$0"
      : abs.lt(100)
      ? `$${abs.decimalPlaces(0, BigNumber.ROUND_DOWN)}`
      : abs.lt(1e3)
      ? `$${stringifyNumberWithGroupingSeparator(abs, 0)}`
      : `$${stringifyNumberWithAbbreviation(abs, 0)}`;

  if ("$0" === formatted) return formatted;
  if (negative) return `-${formatted}`;
  if (!options?.showPlusGtThanZero) return formatted;
  return `+${formatted}`;
};

export type FormatPriceOptions = {
  isHighPrecise: boolean;
};

export const formatPrice = (
  num: BigNumber.Value,
  options: FormatPriceOptions = { isHighPrecise: true },
) => {
  if (!isValidNumber(num)) return "--";

  const bn = new SafeBigNumber(num);
  if (bn.lt(0)) return "--";

  const abs = bn.abs();
  const { isHighPrecise } = options;

  const formatted = abs.lt(1e-4)
    ? stringifyNumberWithLeadingZeroSubscripts(abs, isHighPrecise ? 4 : 2)
    : abs.lt(1)
    ? isHighPrecise
      ? stringifyNumberWithGroupingSeparator(abs, 4)
      : stringifyNumberWithSignificantPrecision(abs, 2)
    : abs.lt(100) || abs.lt(1e4)
    ? stringifyNumberWithGroupingSeparator(abs, isHighPrecise ? 4 : 2)
    : abs.lt(1e5)
    ? stringifyNumberWithGroupingSeparator(abs, 2)
    : stringifyNumberWithAbbreviation(abs);

  return `${formatted}`;
};

export const formatPriceUSD = (
  num: BigNumber.Value,
  options: FormatPriceOptions = { isHighPrecise: true },
) => {
  if (!isValidNumber(num)) return "--";

  const bn = new SafeBigNumber(num);
  if (bn.lt(0)) return "--";

  const abs = bn.abs();
  const { isHighPrecise } = options;

  const formatted = abs.lt(1e-4)
    ? stringifyNumberWithLeadingZeroSubscripts(abs, isHighPrecise ? 4 : 2)
    : abs.lt(1)
    ? isHighPrecise
      ? stringifyNumberWithGroupingSeparator(abs, 4)
      : stringifyNumberWithSignificantPrecision(abs, 2)
    : abs.lt(100) || abs.lt(1e4)
    ? stringifyNumberWithGroupingSeparator(abs, isHighPrecise ? 4 : 2)
    : abs.lt(1e5)
    ? stringifyNumberWithGroupingSeparator(abs, 2)
    : stringifyNumberWithAbbreviation(abs);

  return `$${formatted}`;
};

export type FormatPercentOptions = {
  showPlusGtThanZero?: boolean;
  precision?: number;
};

export const formatPercent = (num: BigNumber.Value, options: FormatPercentOptions = {}) => {
  if (!isValidNumber(num)) return "--%";

  const bn = new SafeBigNumber(num);
  const negative = bn.lt(0);
  const abs = bn.abs();
  const sign = negative ? "-" : options?.showPlusGtThanZero ? "+" : "";

  if (abs.lt(1e-4)) return "0%";
  if (abs.lt(100)) return `${sign}${stringifyPercent(abs, options?.precision ?? 2)}`;
  if (abs.lt(1e3)) return `${sign}${stringifyPercent(abs, options?.precision ?? 1)}`;
  return `${sign}>99,999%`;
};

export const formatPercent2 = (num: BigNumber.Value, options: FormatPercentOptions = {}) => {
  if (!isValidNumber(num)) return "--%";

  const bn = new SafeBigNumber(num);
  const negative = bn.lt(0);
  const abs = bn.abs();
  const sign = negative ? "-" : options?.showPlusGtThanZero ? "+" : "";

  if (abs.lt(1e-5)) return "0%";
  if (abs.lt(100)) return `${sign}${stringifyPercent(abs, options?.precision ?? 2)}`;
  if (abs.lt(1e3)) return `${sign}${stringifyPercent(abs, options?.precision ?? 1)}`;
  return `${sign}>99,999%`;
};

export const formatPercent3 = (
  num: BigNumber.Value,
  options: FormatPercentOptions = { showPlusGtThanZero: false },
) => {
  if (!isValidNumber(num)) return "--%";

  const bn = new SafeBigNumber(num);
  const negative = bn.lt(0);
  const abs = bn.abs();
  const sign = negative ? "-" : options?.showPlusGtThanZero ? "+" : "";

  if (abs.lt(1e-5)) return "0%";
  if (abs.lt(1e3)) return `${sign}${stringifyPercentAbbreviation(abs, options?.precision ?? 1)}`;
  return `${sign}>99K%`;
};

export type FormatMultiplierOptions = {
  showPlusGtThanZero?: boolean;
};

export const formatMultiplier = (
  num: BigNumber.Value,
  options: FormatMultiplierOptions = { showPlusGtThanZero: true },
) => {
  if (!isValidNumber(num)) return "0%";

  const bn = new SafeBigNumber(num);
  const negative = bn.lt(0);
  const abs = bn.abs();
  const sign = negative ? "-" : options?.showPlusGtThanZero ? "+" : "";

  if (abs.lt(0.01)) return "0%";
  if (abs.lt(10)) return `${sign}${stringifyNumberWithGroupingSeparator(abs, 2)}X`;
  if (abs.lt(100)) return `${sign}${stringifyNumberWithGroupingSeparator(abs, 1)}X`;
  if (abs.lt(1e5)) return `${sign}${stringifyNumberWithGroupingSeparator(abs, 0)}X`;
  return `${sign}>99,999%`;
};

export const formatCount = (num: BigNumber.Value) => {
  if (!isValidNumber(num)) return "--";
  const bn = new SafeBigNumber(num);
  return bn.lt(1e5)
    ? stringifyNumberWithGroupingSeparator(bn, 0)
    : stringifyNumberWithAbbreviation(bn);
};

export const formatCount2 = (num: BigNumber.Value) => {
  if (!isValidNumber(num)) return "--";
  const bn = new SafeBigNumber(num);
  return bn.lt(1e3)
    ? stringifyNumberWithGroupingSeparator(bn, 0)
    : stringifyNumberWithAbbreviation(bn.div(1e3).integerValue(BigNumber.ROUND_DOWN).times(1e3), 0);
};

export const formatCount3 = (num: BigNumber.Value) => {
  if (!isValidNumber(num)) return "--";
  const bn = new SafeBigNumber(num);
  return stringifyNumberWithGroupingSeparator(bn, 0);
};

export const displayCount4 = (num: BigNumber.Value) =>
  isValidNumber(num) ? stringifyNumberWithGroupingSeparator(num, 0) : "--";

export const displayCount3 = (num: BigNumber.Value) => {
  if (!isValidNumber(num)) return "--";
  const bn = new SafeBigNumber(num);
  return bn.lt(1e3)
    ? stringifyNumberWithGroupingSeparator(bn, 0)
    : stringifyNumberWithAbbreviation(bn.div(100).integerValue(BigNumber.ROUND_DOWN).times(100));
};

const subscriptDigits = [
  "₀",
  "₁",
  "₂",
  "₃",
  "₄",
  "₅",
  "₆",
  "₇",
  "₈",
  "₉",
  "₁₀",
  "₁₁",
  "₁₂",
  "₁₃",
  "₁₄",
  "₁₅",
  "₁₆",
  "₁₇",
  "₁₈",
  "₁₉",
  "₂₀",
  "₂₁",
  "₂₂",
  "₂₃",
  "₂₄",
  "₂₅",
  "₂₆",
  "₂₇",
  "₂₈",
  "₂₉",
  "₃₀",
  "₃₁",
  "₃₂",
  "₃₃",
  "₃₄",
  "₃₅",
  "₃₆",
  "₃₇",
  "₃₈",
  "₃₉",
  "₄₀",
];

const stringifyNumberWithGroupingSeparator = (
  num: BigNumber.Value,
  precision: number = 0,
  rounding: BigNumber.RoundingMode = BigNumber.ROUND_DOWN,
) => {
  const bn = new SafeBigNumber(num);
  const parts = bn.decimalPlaces(precision, rounding).toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

const stringifyNumberWithAbbreviation = (num: BigNumber.Value, precision: number = 1) => {
  const bn = new SafeBigNumber(num);
  return bn.lt(1e3)
    ? bn.toNumber()
    : bn.lt(1e6)
    ? `${stringifyNumberWithGroupingSeparator(bn.div(1e3), precision)}K`
    : bn.lt(1e9)
    ? `${stringifyNumberWithGroupingSeparator(bn.div(1e6), precision)}M`
    : bn.lt(1e12)
    ? `${stringifyNumberWithGroupingSeparator(bn.dividedBy(1e9), precision)}B`
    : `${stringifyNumberWithGroupingSeparator(bn.dividedBy(1e12), precision)}T`;
};

const stringifyNumberWithLeadingZeroSubscripts = (num: BigNumber.Value, precision: number = 5) => {
  const bn = new SafeBigNumber(num);
  if (bn.eq(0)) return "0";
  const [integerPart, decimalPart] = bn.toFixed().split(".");
  const digits = decimalPart.split("");
  const firstNonZeroIndex = digits.findIndex((num) => "0" !== num);
  const precisionDigitsCount = Math.min(digits.length - firstNonZeroIndex, precision);
  return `${stringifyNumberWithGroupingSeparator(integerPart)}.0`
    .concat(subscriptDigits[firstNonZeroIndex])
    .concat(
      digits
        .slice(firstNonZeroIndex, firstNonZeroIndex + precisionDigitsCount)
        .join("")
        .replace(/\.?0+$/, ""), // trim trailing zeros
    );
};

const stringifyNumberWithSignificantPrecision = (num: BigNumber, precision: number) => {
  const matched = num.toString().match(/\.0*/); // has leading zeros
  const significantPrecision = (matched ? matched[0].length - 1 : 0) + precision;
  return stringifyNumberWithGroupingSeparator(num, significantPrecision);
};

const stringifyPercent = (bn: BigNumber, precision: number) =>
  `${bn.times(100).decimalPlaces(precision, BigNumber.ROUND_HALF_UP).toString()}%`;

const stringifyPercentAbbreviation = (bn: BigNumber, precision: number) =>
  `${stringifyNumberWithAbbreviation(
    bn.times(100).decimalPlaces(precision, BigNumber.ROUND_HALF_UP),
  )}%`;

type StringifyAmountOptions = {
  precision?: number;
  groupingSeparator?: boolean;
  rounding?: "up" | "down" | "ceil" | "floor";
  // abbreviation if number is greater than this value
  acronymMin?: number;
  // display <min if number is less than this value
  min?: number;
  // display >max if number is greater than this value
  max?: number;
  // display this string if number is 0
  zeroDisplay?: string;
};

const stringifyAmountWithClippingAndCapping = (
  num: BigNumber.Value,
  options: StringifyAmountOptions = {},
) => {
  const { precision = 4, min, max, groupingSeparator, rounding, zeroDisplay } = options;

  const roundingMap = {
    up: BigNumber.ROUND_UP,
    down: BigNumber.ROUND_DOWN,
    ceil: BigNumber.ROUND_CEIL,
    floor: BigNumber.ROUND_FLOOR,
  };

  const bn = new SafeBigNumber(num);
  if (bn.eq(0)) return zeroDisplay ? zeroDisplay : "0";

  const abs = bn.abs();

  if (min && abs.lt(min)) return `<${min}`;
  if (max && abs.gt(max)) return `>${max}`;

  if (groupingSeparator) {
    return stringifyNumberWithGroupingSeparator(
      abs,
      precision,
      rounding ? roundingMap[rounding] : undefined,
    );
  }

  const rounded = rounding
    ? abs.decimalPlaces(precision, roundingMap[rounding])
    : abs.decimalPlaces(precision);
  return rounded.toString();
};

const stringifyAmount = (num: BigNumber.Value, options: StringifyAmountOptions = {}) => {
  const bn = new SafeBigNumber(num);
  if (bn.eq(0)) return options.zeroDisplay ? options.zeroDisplay : "";

  const { acronymMin = 1e4 } = options;
  const abs = bn.abs();
  if (abs.lt(acronymMin)) return stringifyAmountWithClippingAndCapping(bn, options);

  if (abs.gte(1e15)) {
    return bn.toExponential(2);
  }
  if (abs.gte(1e12)) {
    return `${stringifyAmountWithClippingAndCapping(bn.div(1e12), { ...options, precision: 0 })}T`;
  }
  if (abs.gte(1e9)) {
    return `${stringifyAmountWithClippingAndCapping(bn.div(1e9), { ...options, precision: 0 })}B`;
  }
  if (abs.gte(1e6)) {
    return `${stringifyAmountWithClippingAndCapping(bn.div(1e6), { ...options, precision: 1 })}M`;
  }
  if (abs.gte(1e4)) {
    return `${stringifyAmountWithClippingAndCapping(bn.div(1e3), { ...options, precision: 1 })}K`;
  }
  return stringifyAmountWithClippingAndCapping(bn, options);
};
