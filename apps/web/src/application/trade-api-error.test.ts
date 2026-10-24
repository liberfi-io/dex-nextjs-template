import { parseTradeApiError } from "./trade-api-error";

describe("parseTradeApiError", () => {
  it.each([
    {
      message:
        'Route failed: ChainStream API error (500): {"code":50006,"message":"Transaction error","details":"insufficient funds for intrinsic transaction cost"}',
      kind: "insufficient_balance",
      code: 50006,
    },
    {
      message:
        'ChainStream API error (500): {"code":50017,"message":"Insufficient balance","details":{"detail":"insufficient funds"}}',
      kind: "insufficient_balance",
      code: 50017,
    },
    {
      message:
        'ChainStream API error (400): {"code":40006,"message":"Insufficient liquidity"}',
      kind: "insufficient_liquidity",
      code: 40006,
    },
    {
      message:
        'ChainStream API error (500): {"code":50010,"message":"DEX route build failed"}',
      kind: "no_route",
      code: 50010,
    },
    {
      message: 'ChainStream API error (400): {"code":40008,"message":"Slippage too high"}',
      kind: "slippage",
      code: 40008,
    },
    { message: "Failed to fetch", kind: "network", code: undefined },
  ])("classifies $kind from the public trade error shape", ({ message, kind, code }) => {
    expect(parseTradeApiError(new Error(message))).toMatchObject({ kind, code });
  });

  it("extracts the HTTP status and flattens nested details", () => {
    expect(
      parseTradeApiError(
        new Error(
          'ChainStream API error (503): {"code":50001,"message":"Unknown error","details":{"detail":"pool is temporarily unavailable"}}',
        ),
      ),
    ).toMatchObject({
      httpStatus: 503,
      code: 50001,
      apiMessage: "Unknown error",
      detailsText: "pool is temporarily unavailable",
      kind: "unknown",
    });
  });

  it("does not confuse insufficient liquidity with wallet balance", () => {
    const parsed = parseTradeApiError(
      new Error(
        'ChainStream API error (500): {"code":50006,"message":"Transaction error","details":"insufficient liquidity"}',
      ),
    );

    expect(parsed.kind).toBe("insufficient_liquidity");
  });

  it("accepts an already structured backend error", () => {
    expect(
      parseTradeApiError({
        code: 50017,
        message: "Insufficient balance",
        details: { reason: "insufficient lamports" },
      }),
    ).toMatchObject({
      code: 50017,
      detailsText: "insufficient lamports",
      kind: "insufficient_balance",
    });
  });

  it("accepts future structured Error instances without relying on the message wrapper", () => {
    const error = Object.assign(new Error("Transaction error"), {
      code: 50017,
      status: 500,
      details: { detail: "insufficient funds" },
    });

    expect(parseTradeApiError(error)).toMatchObject({
      httpStatus: 500,
      code: 50017,
      detailsText: "insufficient funds",
      kind: "insufficient_balance",
    });
  });

  it.each([
    ["insufficient funds for gas", "insufficient_balance"],
    ["no route found", "no_route"],
    ["slippage too high", "slippage"],
  ])("classifies an unwrapped error message: %s", (message, kind) => {
    expect(parseTradeApiError(new Error(message)).kind).toBe(kind);
  });

  it("never throws while inspecting a hostile error object", () => {
    const hostile = new Proxy(
      {},
      {
        get() {
          throw new Error("getter failed");
        },
        ownKeys() {
          throw new Error("enumeration failed");
        },
      },
    );

    expect(() => parseTradeApiError(hostile)).not.toThrow();
    expect(parseTradeApiError(hostile)).toMatchObject({
      rawMessage: "",
      detailsText: "",
      kind: "unknown",
    });
  });
});
