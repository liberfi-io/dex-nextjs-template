import BigNumber from "bignumber.js";

// @deprecated
export function parseNumberDeprecated(value: string): number {
  return parseFloat(
    value.startsWith("0x") ? new BigNumber(value, 16).shiftedBy(-18).toString() : value,
  );
}

// @deprecated
export function formatNumberDeprecated(price: number | string, digits: number = 5): string {
  if (digits <= 0) {
    throw new Error("Digits must be a positive number");
  }
  const priceNumber =
    typeof price === "string"
      ? parseFloat(
          price.startsWith("0x") ? new BigNumber(price, 16).shiftedBy(-18).toString() : price,
        )
      : price;

  // 定义单位
  const units = [
    { value: 1e9, suffix: "B" }, // 十亿
    { value: 1e6, suffix: "M" }, // 百万
    { value: 1e3, suffix: "K" }, // 千
    { value: 1, suffix: "" }, // 无单位
  ];

  // 找到合适的单位
  const selectedUnit =
    units.find((unit) => Math.abs(priceNumber) >= unit.value) || units[units.length - 1];

  // 将价格转换为目标单位
  const scaledPrice = priceNumber / selectedUnit.value;

  // 计算需要保留的小数位数
  const integerPartLength = Math.floor(scaledPrice).toString().length;
  const decimalPlaces = Math.max(0, digits - integerPartLength);

  // 四舍五入到指定小数位数
  const roundedPrice = parseFloat(scaledPrice.toFixed(decimalPlaces));

  // 转换为字符串并去除末尾的连续0
  let formattedPrice = roundedPrice.toString();
  if (formattedPrice.includes(".")) {
    formattedPrice = formattedPrice.replace(/0+$/, ""); // 去除末尾的连续0
    if (formattedPrice.endsWith(".")) {
      formattedPrice = formattedPrice.slice(0, -1); // 如果小数点后全是0，去除小数点
    }
  }

  // 添加单位后缀
  return formattedPrice + selectedUnit.suffix;
}

export function formatShortAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4,
): string {
  // 检查地址是否有效
  if (!address || address.length < startLength + endLength) {
    return address;
  }

  // 截取前 startLength 位和后 endLength 位
  const start = address.substring(0, startLength);
  const end = address.substring(address.length - endLength);

  // 返回缩短后的地址
  return `${start}...${end}`;
}

const ZERO = "0";

const countZeros = (decimalDigits: string): number => {
  let zeroCount = 0;
  for (let i = 0; i < decimalDigits.length && decimalDigits[i] === ZERO; i++) {
    zeroCount++;
  }
  return zeroCount;
};

export const formatZeroNumbers = (formattedValue: string, zerosThreshold: number = 3) => {
  const punctuationSymbol = formattedValue.match(/[.,]/g)?.pop();
  const hasCurrencySymbol = formattedValue.match(/^[^\d]/)?.pop() !== undefined;
  const significantDigitsSubStart = hasCurrencySymbol ? 1 : 0;
  const currencySign = hasCurrencySymbol ? formattedValue[0] : undefined;

  if (!punctuationSymbol) {
    return {
      currencySign,
      significantDigits: formattedValue.substring(significantDigitsSubStart),
    };
  }

  const punctIdx = formattedValue.lastIndexOf(punctuationSymbol);
  if (!formattedValue.includes(ZERO, punctIdx + 1) || punctIdx === formattedValue.length - 1) {
    return {
      currencySign,
      significantDigits: formattedValue.substring(significantDigitsSubStart, punctIdx),
      punctuationSymbol,
      zeros: 0,
      decimalDigits: formattedValue.substring(punctIdx + 1),
    };
  }

  const charsAfterPunct = formattedValue.slice(punctIdx + 1);
  const zerosCount = countZeros(charsAfterPunct);

  if (zerosCount < zerosThreshold) {
    return {
      currencySign,
      significantDigits: formattedValue.substring(significantDigitsSubStart, punctIdx),
      punctuationSymbol,
      zeros: 0,
      decimalDigits: charsAfterPunct,
    };
  }

  const otherDigits = charsAfterPunct.substring(zerosCount);
  const canDisplayZeros = zerosCount !== 0 || otherDigits.length !== 0;

  return {
    currencySign,
    significantDigits: formattedValue.substring(significantDigitsSubStart, punctIdx),
    zeros: canDisplayZeros ? zerosCount : 0,
    decimalDigits: otherDigits,
    punctuationSymbol,
  };
};

export const addThousandSeparator = (numStr: string): string => {
  try {
    const bigNumber = new BigNumber(numStr.replace(/[^0-9.]/g, ""));
    if (bigNumber.isNaN()) {
      return numStr;
    }
    return bigNumber.toFormat();
  } catch (error) {
    console.error("Error formatting number:", error);
    return numStr;
  }
};

// @deprecated
export const formatNumber2 = (input: number | string) => {
  const negative = new BigNumber(input).isNegative();
  const num = new BigNumber(input).abs();

  const numStr = num.gte(10)
    ? num.toFormat(2)
    : num.gte(1)
    ? num.precision(4).toFormat()
    : num.precision(4, BigNumber.ROUND_DOWN).toFormat();

  const { currencySign, significantDigits, zeros, decimalDigits, punctuationSymbol } =
    formatZeroNumbers(numStr);
  return {
    currencySign,
    significantDigits: `${negative ? "-" : ""}${addThousandSeparator(significantDigits)}`,
    zeros,
    decimalDigits,
    punctuationSymbol,
    suffix: undefined,
  };
};

// @deprecated
export const formatAbbreviatingNumber2 = (input: number | string) => {
  const negative = new BigNumber(input).isNegative();
  const num = new BigNumber(input).abs();

  // 定义单位和大数缩写的映射
  const units = [
    { value: new BigNumber(1e15), suffix: "P" }, // Pillion
    { value: new BigNumber(1e12), suffix: "T" }, // Trillion
    { value: new BigNumber(1e9), suffix: "B" }, // Billion
    { value: new BigNumber(1e6), suffix: "M" }, // Million
    { value: new BigNumber(1e3), suffix: "K" }, // Thousand
    { value: new BigNumber(1), suffix: "" }, // No suffix
  ];

  // 找到合适的单位和缩写
  const unit = units.find((u) => num.gte(u.value)) || units[units.length - 1];
  let scaledNum = num.dividedBy(unit.value);

  // TODO 返回的有些数据太离谱了，先处理一下保证数据好看
  if (unit.suffix === units[0].suffix && scaledNum.gt(100)) {
    while (scaledNum.gt(100)) {
      scaledNum = scaledNum.shiftedBy(-1);
    }
  }

  // 保留小数精度
  const formattedNum =
    unit.suffix !== "" || scaledNum.isGreaterThanOrEqualTo(10)
      ? scaledNum.toFormat(2)
      : scaledNum.isGreaterThanOrEqualTo(1)
      ? scaledNum.precision(4).toFormat()
      : scaledNum.precision(4, BigNumber.ROUND_DOWN).toFormat();

  // 分割整数和小数部分
  const decimalSeparator = BigNumber.config().FORMAT?.decimalSeparator ?? ".";
  const parts = formattedNum.split(decimalSeparator);

  let numStr = formattedNum;
  if (parts.length > 1) {
    const integerPart = parts[0];
    // 去除小数部分的末尾零
    const decimalPart = parts[1].replace(/0+$/, "");
    // 若小数部分全被去除，则省略小数点
    numStr = decimalPart === "" ? integerPart : `${integerPart}${decimalSeparator}${decimalPart}`;
  }

  const { currencySign, significantDigits, zeros, decimalDigits, punctuationSymbol } =
    formatZeroNumbers(numStr);
  return {
    currencySign,
    significantDigits: `${negative ? "-" : ""}${addThousandSeparator(significantDigits)}`,
    zeros,
    decimalDigits,
    punctuationSymbol,
    suffix: unit.suffix || undefined,
  };
};

export function formatPercentage(input: string | number, multiply: number = 100): string {
  // 将输入转换为 BigNumber
  const negative = new BigNumber(input).isNegative();
  const num = new BigNumber(input).abs().multipliedBy(multiply);

  // 定义单位和大数缩写的映射
  const units = [
    { value: new BigNumber(1e15), suffix: "P" }, // Pillion
    { value: new BigNumber(1e12), suffix: "T" }, // Trillion
    { value: new BigNumber(1e9), suffix: "B" }, // Billion
    { value: new BigNumber(1e6), suffix: "M" }, // Million
    { value: new BigNumber(1e3), suffix: "K" }, // Thousand
    { value: new BigNumber(1), suffix: "" }, // No suffix
  ];

  // 找到合适的单位和缩写
  const unit = units.find((u) => num.gte(u.value)) || units[units.length - 1];
  const scaledNum = num.dividedBy(unit.value);

  // 值过小
  if (unit.suffix === "" && scaledNum.eq(0)) {
    return "0%";
  }

  if (unit.suffix === "" && scaledNum.lt(0.01)) {
    if (negative) {
      return "-<0.01%";
    } else {
      return "<0.01%";
    }
  }

  // 保留小数精度
  const formattedNum =
    unit.suffix !== "" || scaledNum.isGreaterThanOrEqualTo(10)
      ? scaledNum.toFormat(2)
      : scaledNum.isGreaterThanOrEqualTo(1)
      ? scaledNum.precision(2).toFormat()
      : scaledNum.precision(2, BigNumber.ROUND_DOWN).toFormat();

  // 分割整数和小数部分
  const decimalSeparator = BigNumber.config().FORMAT?.decimalSeparator ?? ".";
  const parts = formattedNum.split(decimalSeparator);

  let numStr = formattedNum;
  if (parts.length > 1) {
    const integerPart = parts[0];
    // 去除小数部分的末尾零
    const decimalPart = parts[1].replace(/0+$/, "");
    // 若小数部分全被去除，则省略小数点
    numStr = decimalPart === "" ? integerPart : `${integerPart}${decimalSeparator}${decimalPart}`;
  }
  return `${negative ? "-" : ""}${numStr}%`;
}

export function formatAge(
  date: string | number,
  now: number = new Date().getTime(),
  milliseconds: boolean = true,
): string {
  // 检查输入是否为时间戳或日期字符串
  let timestamp: number;
  if (typeof date === "string") {
    // 使用正则判断是否为时间戳字符串(纯数字)
    const timestampRegex = /^\d+$/;
    if (timestampRegex.test(date)) {
      timestamp = Math.floor(parseInt(date) / (milliseconds ? 1000 : 1));
    } else {
      // 尝试将字符串解析为日期
      const parsedDate = new Date(date).getTime();
      if (isNaN(parsedDate)) {
        throw new Error("Invalid date string");
      }
      timestamp = Math.floor(parsedDate / 1000);
    }
  } else {
    // 如果是数字,假定为时间戳
    timestamp = Math.floor(date / (milliseconds ? 1000 : 1));
  }

  // 计算与当前时间的差值(秒)
  const nowSeconds = Math.floor(now / 1000);
  const seconds = Math.max(0, nowSeconds - timestamp);

  return formatDuration(seconds);
}

export function formatDuration(seconds: number): string {
  const MINUTE = 60;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const YEAR = 365 * DAY;

  if (seconds >= YEAR) {
    const years = Math.floor(seconds / YEAR);
    return `${years}Y`;
  }
  if (seconds >= DAY) {
    const days = Math.floor(seconds / DAY);
    return `${days}D`;
  }
  if (seconds >= HOUR) {
    const hours = Math.floor(seconds / HOUR);
    return `${hours}h`;
  }
  if (seconds >= MINUTE) {
    const minutes = Math.floor(seconds / MINUTE);
    return `${minutes}m`;
  }
  return `${seconds}s`;
}
