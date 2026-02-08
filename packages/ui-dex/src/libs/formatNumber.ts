import BigNumber from "bignumber.js";

// 数值的默认精度
function defaultPrecision(num: BigNumber) {
  const value = num.abs();

  let precision = 10;

  if (value.gte(1)) precision = 2;
  else if (value.gte(0.1)) precision = 3;
  else if (value.gte(0.01)) precision = 4;
  else if (value.gte(0.001)) precision = 5;
  else if (value.gte(1e-4)) precision = 6;
  else if (value.gte(1e-5)) precision = 7;
  else if (value.gte(1e-6)) precision = 8;
  else if (value.gte(1e-7)) precision = 9;

  return precision;
}

// 币种默认精度
const coinPrecisions: Record<string, number> = {
  BTC: 6,
  ETH: 5,
};

// 舍入模式
const roundingModes = {
  up: BigNumber.ROUND_UP,
  down: BigNumber.ROUND_DOWN,
  ceil: BigNumber.ROUND_CEIL,
  floor: BigNumber.ROUND_FLOOR,
};

export type RoundingMode = keyof typeof roundingModes;

// 不同语言的大数缩写配置
type CompactConfig = {
  min: number;
  exponent: number;
};

const englishCompactConfigs: CompactConfig[] = [
  { min: 1e3, exponent: 3 }, // K
  { min: 1e6, exponent: 6 }, // M
  { min: 1e9, exponent: 9 }, // B
  { min: 1e12, exponent: 12 }, // T
];

const chineseCompactConfigs: CompactConfig[] = [
  { min: 1e4, exponent: 4 }, // 万
  { min: 1e8, exponent: 8 }, // 亿
  { min: 1e12, exponent: 12 }, // 万亿
];

const germanCompactConfigs: CompactConfig[] = [
  { min: 1e6, exponent: 6 }, // Mio
  { min: 1e9, exponent: 9 }, // Mrd
  { min: 1e12, exponent: 12 }, // T
];

const koreanCompactConfigs: CompactConfig[] = [
  { min: 1e3, exponent: 3 }, // 천
  { min: 1e4, exponent: 4 }, // 만
  { min: 1e8, exponent: 8 }, // 억
  { min: 1e12, exponent: 12 }, // 조
];

// 百分比是 x100 以后进行大数缩写，所以实际的值要除以 100
// 例如 0.12 => 12%, 13.56 => 1.356K%
function percentCompactConfig(config: CompactConfig): CompactConfig {
  return {
    min: config.min / 100,
    exponent: config.exponent,
  };
}

const englishPercentCompactConfigs = englishCompactConfigs.map(percentCompactConfig);

const chinesePercentCompactConfigs = chineseCompactConfigs.map(percentCompactConfig);

const germanPercentCompactConfigs = germanCompactConfigs.map(percentCompactConfig);

const koreanPercentCompactConfigs = koreanCompactConfigs.map(percentCompactConfig);

// 国际化到大数缩写配置的映射
const localeCompactConfigsMap = new Map([
  ["en", englishCompactConfigs],
  ["ar", englishCompactConfigs],
  ["fi", englishCompactConfigs],
  ["fr", englishCompactConfigs],
  ["id", englishCompactConfigs],
  ["ms", englishCompactConfigs],
  ["pt", englishCompactConfigs],
  ["ro", englishCompactConfigs],
  ["ru", englishCompactConfigs],
  ["th", englishCompactConfigs],
  ["tr", englishCompactConfigs],
  ["vi", englishCompactConfigs],
  ["zh-CN", chineseCompactConfigs],
  ["zh-TW", chineseCompactConfigs],
  ["ja", chineseCompactConfigs],
  ["de", germanCompactConfigs],
  ["ko", koreanCompactConfigs],
]);

const localePercentCompactConfigsMap = new Map([
  ["en", englishPercentCompactConfigs],
  ["ar", englishPercentCompactConfigs],
  ["fi", englishPercentCompactConfigs],
  ["fr", englishPercentCompactConfigs],
  ["id", englishPercentCompactConfigs],
  ["ms", englishPercentCompactConfigs],
  ["pt", englishPercentCompactConfigs],
  ["ro", englishPercentCompactConfigs],
  ["ru", englishPercentCompactConfigs],
  ["th", englishPercentCompactConfigs],
  ["tr", englishPercentCompactConfigs],
  ["vi", englishPercentCompactConfigs],
  ["zh-CN", chinesePercentCompactConfigs],
  ["zh-TW", chinesePercentCompactConfigs],
  ["ja", chinesePercentCompactConfigs],
  ["de", germanPercentCompactConfigs],
  ["ko", koreanPercentCompactConfigs],
]);

// 大数缩写指数对应的值
const compactExponents = [
  1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13, 1e14,
];

// 对数字进行舍入
function roundNumber(
  num: BigNumber,
  precision: number,
  compactPrecision: number,
  rounding: RoundingMode | undefined,
  isPercent: boolean,
  compact: boolean,
  locale: string,
): {
  // 舍入后的数字
  roundedNum: BigNumber;
  // 是否进行了大数缩写
  compacted: boolean;
} {
  const roundingMode = roundingModes[rounding || "floor"] ?? BigNumber.ROUND_FLOOR;
  const absNum = num.abs();

  let compacted = false;
  let compactExponent = 0;

  if (compact) {
    const compactConfigs = isPercent
      ? localePercentCompactConfigsMap.get(locale)
      : localeCompactConfigsMap.get(locale);

    if (compactConfigs) {
      for (const config of compactConfigs) {
        if (absNum.lt(config.min)) break;
        compacted = true;
        compactExponent = config.exponent;
      }
    }
  }

  // 小数精度
  const finalPrecision = compacted ? compactPrecision : precision;
  // 百分比是 x100 以后进行大数缩写，所以实际的值要除以 100
  const finalCompactExponent = isPercent ? compactExponent - 2 : compactExponent;

  let roundedNum = num;

  if (
    roundingMode === BigNumber.ROUND_DOWN ||
    (roundingMode === BigNumber.ROUND_FLOOR && num.gt(0)) ||
    (roundingMode === BigNumber.ROUND_CEIL && num.lt(0))
  ) {
    // 朝 0 舍入，超过精度的小数部分可以直接裁掉

    // 舍入位置。大数压缩需要按照压缩后的数值来计算精度，因此舍入位置在整数部分。
    // 例如：
    //  精度为2，则 1234.56789 => 1.23K，舍入位置是十位
    //  精度为4，则 1234.56789 => 1.2345K，舍入位置是十分位
    const roundPosition = finalPrecision - finalCompactExponent;
    // 分割出整数部分和小数部分，小数部分应该不会超过 20 位吧...
    const [intPart, decPart = ""] = num.toFixed(20, BigNumber.ROUND_FLOOR).split(".");
    // 小数部分去掉结尾的 0
    const trimmedDecPart = decPart.replace(/0+$/, "");
    // 整数部分有效长度
    const intLength = intPart.length;
    // 小数部分有效长度
    const decLength = trimmedDecPart.length;

    if (0 === roundPosition) {
      // 在个位舍入，抹去小数部分即可
      roundedNum = new BigNumber(intPart);
    } else if (roundPosition < 0) {
      // 在整数部分舍入
      roundedNum = new BigNumber(
        intPart.substring(0, intLength + roundPosition).padEnd(intLength, "0"),
      );
    } else {
      // 在小数部分舍入
      if (decLength <= roundPosition) {
        // 小数部分精度足够，直接返回
        roundedNum = num;
      } else {
        // 小数部分超过精度的直接裁掉
        roundedNum = new BigNumber(`${intPart}.${trimmedDecPart.substring(0, roundPosition)}`);
      }
    }
  } else {
    // 不是朝 0 舍入，要进行实际的舍入计算
    if (0 === finalCompactExponent) {
      // 原数舍入
      roundedNum = num.decimalPlaces(finalPrecision, roundingMode);
    } else if (finalCompactExponent > 0) {
      // 大数压缩，要按压缩后的数值进行舍入
      const factor = compactExponents[finalCompactExponent];
      roundedNum = num.div(factor).decimalPlaces(finalPrecision, roundingMode).times(factor);
    } else {
      // 百分比要 x100 后进行舍入
      const factor = compactExponents[-finalCompactExponent];
      roundedNum = num.times(factor).decimalPlaces(finalPrecision, roundingMode).div(factor);
    }
  }

  return { roundedNum, compacted };
}

export type FormatNumberOptions = {
  // 精度，default 保持数值原本的精度
  precision?: "default" | number;
  // 是否进行大数压缩
  compact?: boolean;
  // 大数压缩的精度
  compactPrecision?: number;
  // 舍入模式
  rounding?: RoundingMode;
  // 显示样式
  style?: Intl.NumberFormatOptions["style"];
  // 是否使用千分位分隔符
  grouping?: Intl.NumberFormatOptions["useGrouping"];
  // 显示负号
  sign?: Intl.NumberFormatOptions["signDisplay"];
  // 如果 style 为 currency，则需要指定货币
  currency?: Intl.NumberFormatOptions["currency"];
  // 国际化语言
  locale?: string;
  // 显示的币种，比如 ETC, ETH...
  coin?: string;
  // 是否为有效数字精度
  // 例如: 0.00012345, 精度为 4，如果是有效数字精度为 0.0001234，不是有效数字精度为 0.0001
  significantPrecision?: boolean;
  // 是否按精度补齐结尾的 0
  pad?: boolean;
  // 小数点后连续的 0 是否显示为下标
  subscriptZeros?: "always" | boolean;
};

// 格式化实例缓存
const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatterCacheKey(locale: string, options: Intl.NumberFormatOptions) {
  return `${locale}-${options.minimumFractionDigits}-${options.maximumFractionDigits}-${options.style}-${options.signDisplay}-${options.currency}-${options.useGrouping}-${options.notation}-${options.compactDisplay}`;
}

// 是否可以将小数点后连续 0 转换为下标
export function shouldShowZerosSubscript(
  value: BigNumber.Value,
  alwaysShowWhenZero: boolean,
): boolean {
  const num = new BigNumber(value);
  // < 0.0001 才可以显示
  return -1 === num.abs().comparedTo(1e-4) && (!alwaysShowWhenZero || !num.isZero());
}

// 获取小数点后连续 0 的个数
export function getZerosCount(value: BigNumber.Value, alwaysShowWhenZero: boolean): number {
  const num = new BigNumber(value);
  return shouldShowZerosSubscript(num, alwaysShowWhenZero)
    ? (num.isZero() ? `${value}` : num.toFixed()).match(RegExp("(\\.(0+))"))?.[2].length || 0
    : 0;
}

function getBeforeSeparator(str: string, separator: string) {
  return str.split(separator)[0];
}

const subscriptDigits = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];

function toSubscriptNumber(num: number) {
  return num <= 0
    ? ""
    : String(num)
        .split("")
        .reduce((acc, digit) => acc + subscriptDigits[Number(digit)], "");
}

// 添加下标零
function addSubscriptZeros(
  value: string,
  formattedStr: string,
  separator = ".",
  alwaysShowWhenZero = true,
) {
  const zerosCount = getZerosCount(value, alwaysShowWhenZero);
  if (0 === zerosCount) return formattedStr;

  const beforeSeparator = getBeforeSeparator(formattedStr, separator);
  return `${beforeSeparator}${separator}0${toSubscriptNumber(zerosCount)}${formattedStr.slice(
    beforeSeparator.length + 1 + zerosCount,
  )}`;
}

/**
 * 格式化数值
 * @param value 数值
 * @param options 格式化选项
 * @returns 格式化后的数字
 */
export function formatNumber(
  value: BigNumber.Value = 0,
  options: FormatNumberOptions = {},
): string {
  const num = new BigNumber(value);

  const {
    compact = false,
    compactPrecision = 2,
    rounding,
    grouping,
    locale = "en",
    style = "decimal",
    sign,
    currency = "USD",
    coin,
    subscriptZeros = false,
    significantPrecision = false,
    pad = false,
  } = options;

  const isPercent = "percent" === style;

  // 获得精度
  let { precision = "default" } = options;
  if (undefined === precision) {
    if (isPercent) {
      // 默认百分数只保留整数精度
      precision = 2;
    } else {
      precision = defaultPrecision(num);
      if (isPercent) {
        // 百分数是 x100 以后显示，所以精度要减 2
        precision = precision > 2 ? precision - 2 : 0;
      } else if (coin) {
        // 如果指定了币种，则按照币种的精度
        const coinPrecision = coinPrecisions[coin];
        if (coinPrecision && precision < coinPrecision) {
          precision = coinPrecision;
        }
      }
    }
  } else if ("default" === precision) {
    // 按照数值本身的精度
    precision = Math.min(num.decimalPlaces()!, 20);
  } else if (significantPrecision && precision >= 0) {
    // 有效数字精度
    // 例如: 0.00012345, 精度为 4，如果是有效数字精度为 0.0001234，不是有效数字精度为 0.0001
    precision = num.decimalPlaces()! - num.precision() + precision;
  }

  // 对数字进行舍入
  const { roundedNum, compacted } = roundNumber(
    num,
    precision,
    compactPrecision,
    rounding,
    isPercent,
    compact,
    locale,
  );

  if (compacted) {
    precision = compactPrecision;
  }

  // 配置格式化选项
  const formatOptions: Intl.NumberFormatOptions = {
    // 如果 pad 就需要按精度补齐结尾的 0
    minimumFractionDigits: Math.min(Math.max(pad ? precision : 0, 0), 20),
    maximumFractionDigits: Math.min(Math.max(precision, 0), 20),
    style,
    signDisplay: sign || "auto",
    currency,
    useGrouping: grouping,
  };

  // 百分数代表涨跌，因此默认都显示正负号
  if (isPercent && !sign) {
    if ("-0" === value) {
      // -0 不需要显示负号
      formatOptions.signDisplay = "auto";
    } else {
      formatOptions.signDisplay = "always";
    }
  }

  // 大数压缩
  if (compact) {
    formatOptions.notation = "compact";
    formatOptions.compactDisplay = "short";
  }

  // 格式化实例
  const cacheKey = getFormatterCacheKey(locale, formatOptions);
  let formatter = formatterCache.get(cacheKey);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, formatOptions);
    formatterCache.set(cacheKey, formatter);
  }

  try {
    // 格式化数值
    let result = formatter.format(roundedNum.toNumber());

    // 处理小数点后的连续下标零
    if (subscriptZeros) {
      // 去掉货币、正负号等符号，方便来检测小数点
      formatOptions.signDisplay = "never";
      delete formatOptions.currency;
      delete formatOptions.style;

      const newCacheKey = getFormatterCacheKey(locale, formatOptions);
      formatter = formatterCache.get(newCacheKey);

      if (!formatter) {
        formatter = new Intl.NumberFormat(locale, formatOptions);
        formatterCache.set(newCacheKey, formatter);
      }

      // 匹配第一个非数字，获得小数点分隔符，有些国家小数点是 ","
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      const separator = formatter.format(1.1).match(/[\D]/)?.[0]!;
      result = addSubscriptZeros(
        (num.isZero() ? value : isPercent ? roundedNum.times(100) : roundedNum).toString(),
        result,
        separator,
        "always" === subscriptZeros,
      );
    }

    return result;
  } catch (error) {
    // 如果格式化失败，则返回原始数值
    console.error("format number error", error);
    return roundedNum.toNumber().toString();
  }
}

// 获取数值的默认精度
export function getNumberDefaultPrecision(value: BigNumber.Value, precision: boolean) {
  const num = new BigNumber(value);
  if (num.lt(1)) {
    // < 0，精细显示保留 5 位有效数字，粗略显示保留 2 位有效数字
    return num.decimalPlaces()! - num.precision() + (precision ? 5 : 2);
  }
  if (num.lt(1e4)) {
    // 1 ~ 10000 精细显示保留 4 位小数，粗略显示保留 2 位小数
    return precision ? 4 : 2;
  }
  // > 10000 保留 2 位小数
  return 2;
}

// 格式化为长格式
export function formatLongNumber(value: BigNumber.Value, precision: boolean = true): string {
  return formatNumber(value, {
    precision: getNumberDefaultPrecision(value, precision),
    subscriptZeros: true,
    compact: false,
    grouping: true,
    pad: true,
  });
}

// 格式化为短格式
export function formatShortNumber(value: BigNumber.Value, precision: boolean = true): string {
  return formatNumber(value, {
    precision: getNumberDefaultPrecision(value, precision),
    subscriptZeros: true,
    compact: true,
    grouping: true,
    pad: true,
  });
}

/**
 * 计算小数精度
 * @param value 数值
 * @param options 精度选项
 * @param options.precision 是否精细
 * @returns 小数精度
 */
export function calculateDecimalPrecision(
  value: string | number,
  options: {
    precision?: boolean;
  } = {},
): number {
  const decimalValue = new BigNumber(value);

  // 定义阈值常量提升可读性
  const THRESHOLD_SMALL = 0.001;
  const THRESHOLD_MEDIUM = 1;
  const THRESHOLD_LARGE = 10_000;

  // 分步处理不同区间的精度计算
  if (decimalValue.lt(THRESHOLD_SMALL)) {
    return calculateSmallValuePrecision(decimalValue, options);
  } else if (decimalValue.lt(THRESHOLD_MEDIUM)) {
    return calculateMediumValuePrecision(decimalValue, options);
  } else if (decimalValue.lt(THRESHOLD_LARGE)) {
    return options.precision ? 4 : 2;
  }
  return 2;
}

// 拆分小数值处理逻辑
function calculateSmallValuePrecision(value: BigNumber, options: { precision?: boolean }): number {
  const decimalPlaces = value.dp() ?? 0;
  const precisionAdjustment = options.precision ? 5 : 2;
  return decimalPlaces - value.precision() + precisionAdjustment;
}

// 拆分中等数值处理逻辑
function calculateMediumValuePrecision(value: BigNumber, options: { precision?: boolean }): number {
  const decimalPlaces = value.dp() ?? 0;
  return options.precision
    ? decimalPlaces - value.precision() + 5
    : decimalPlaces - value.precision() + 2;
}
