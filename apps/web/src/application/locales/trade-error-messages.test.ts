import { createApplicationLocaleRuntime } from "./createApplicationLocaleRuntime";

describe("trade error locale resources", () => {
  const errorKeys = [
    "insufficientLiquidity",
    "slippage",
    "priceImpact",
    "noRoute",
    "invalidAmount",
    "sameToken",
    "txRejected",
    "txExpired",
    "network",
    "unauthorized",
    "rateLimit",
    "unknown",
  ];

  it("provides the application trade error messages in English", () => {
    const runtime = createApplicationLocaleRuntime("en");

    expect(runtime.resolve("extend.trade.error.noRoute")).toBe("No available swap route");
    expect(runtime.resolve("extend.trade.error.unknown")).toBe(
      "Transaction failed. Please try again.",
    );
    expect(
      errorKeys.every(
        (key) => runtime.resolve(`extend.trade.error.${key}`) !== `extend.trade.error.${key}`,
      ),
    ).toBe(true);
  });

  it("provides the application trade error messages in Chinese", () => {
    const runtime = createApplicationLocaleRuntime("zh");

    expect(runtime.resolve("extend.trade.error.noRoute")).toBe("暫無可用兌換路徑");
    expect(runtime.resolve("extend.trade.error.unknown")).toBe("交易失敗，請稍後重試");
    expect(
      errorKeys.every(
        (key) => runtime.resolve(`extend.trade.error.${key}`) !== `extend.trade.error.${key}`,
      ),
    ).toBe(true);
  });
});
