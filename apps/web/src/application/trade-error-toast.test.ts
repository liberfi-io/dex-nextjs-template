import { getTradeErrorToastMessage, type TradeErrorTranslator } from "./trade-error-toast";

const translate: TradeErrorTranslator = (key) => {
  const messages: Record<string, string> = {
    "trade.insufficientBalance": "余额不足",
    "extend.trade.error.noRoute": "暂无可用兑换路径",
    "extend.trade.error.network": "网络异常，请稍后重试",
    "extend.trade.error.txExpired": "报价已过期，请重试",
    "extend.trade.error.unknown": "交易失败，请稍后重试",
  };

  return messages[key] ?? key;
};

describe("getTradeErrorToastMessage", () => {
  it("turns a wrapped insufficient-funds route error into an i18n balance message", () => {
    const error = new Error(
      'Route failed: ChainStream API error (500): {"code":50006,"message":"Transaction error","details":"insufficient funds for intrinsic transaction cost"}',
    );

    const message = getTradeErrorToastMessage(error, "route", translate);

    expect(message).toBe("余额不足");
    expect(message).not.toContain("ChainStream API error");
    expect(message).not.toContain("{");
  });

  it.each([
    {
      message:
        'ChainStream API error (500): {"code":50010,"message":"DEX route build failed"}',
      phase: "route" as const,
      expected: "暂无可用兑换路径",
    },
    { message: "Failed to fetch", phase: "route" as const, expected: "网络异常，请稍后重试" },
    {
      message: "Swap route expired",
      phase: "expired" as const,
      expected: "报价已过期，请重试",
    },
  ])("maps a $phase error to its translated message", ({ message, phase, expected }) => {
    expect(getTradeErrorToastMessage(new Error(message), phase, translate)).toBe(expected);
  });

  it("shows safe parsed details for an otherwise unknown backend error", () => {
    const error = new Error(
      'ChainStream API error (500): {"code":50001,"message":"Unknown error","details":{"detail":"pool is temporarily unavailable"}}',
    );

    expect(getTradeErrorToastMessage(error, "route", translate)).toBe(
      "pool is temporarily unavailable",
    );
  });

  it("uses the translated generic message when an unknown error has no details", () => {
    const error = new Error(
      'ChainStream API error (500): {"code":50001,"message":"Unknown error"}',
    );

    expect(getTradeErrorToastMessage(error, "route", translate)).toBe(
      "交易失败，请稍后重试",
    );
  });

  it.each([
    [50017, "trade.insufficientBalance"],
    [40006, "extend.trade.error.insufficientLiquidity"],
    [40008, "extend.trade.error.slippage"],
    [40007, "extend.trade.error.priceImpact"],
    [50010, "extend.trade.error.noRoute"],
    [40014, "extend.trade.error.invalidAmount"],
    [40017, "extend.trade.error.sameToken"],
    [40010, "extend.trade.error.txRejected"],
    [50004, "extend.trade.error.txExpired"],
    [401, "extend.trade.error.unauthorized"],
    [42901, "extend.trade.error.rateLimit"],
  ])("maps backend code %i to the expected i18n key", (code, expectedKey) => {
    const error = new Error(
      `ChainStream API error (400): ${JSON.stringify({ code, message: "Known error" })}`,
    );

    expect(getTradeErrorToastMessage(error, "route", (key) => key)).toBe(expectedKey);
  });
});
