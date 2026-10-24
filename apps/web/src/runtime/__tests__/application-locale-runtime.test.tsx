import { createApplicationLocaleRuntime } from "../createApplicationLocaleRuntime";

describe("application locale runtime", () => {
  it("loads application shell copy from the SDK-owned runtime", () => {
    const runtime = createApplicationLocaleRuntime("en");
    expect(runtime.i18n.t("extend.header.home")).toBe("Home");
    expect(runtime.i18n.t("trade.buy")).toBe("Buy");
  });

  it("loads application and domain copy from the SDK-owned runtime", () => {
    const runtime = createApplicationLocaleRuntime("en");
    expect(runtime.i18n.t("trade.buy")).toBe("Buy");
    expect(runtime.i18n.t("extend.header.home")).toBe("Home");
    expect(runtime.i18n.t("account.withdraw")).toBe("Withdraw");
  });

  it("creates isolated layout instances", async () => {
    const first = createApplicationLocaleRuntime("en");
    const second = createApplicationLocaleRuntime("en");
    await first.change("zh");
    expect(first.i18n.language).not.toBe(second.i18n.language);
  });

  it("resolves representative homepage copy in Chinese without English fallback", () => {
    const runtime = createApplicationLocaleRuntime("zh");

    expect(runtime.resolve("common.signIn")).toBe("登入");
    expect(runtime.resolve("tokens.search.placeholder")).toBe("搜尋代幣或合約地址...");
    expect(runtime.resolve("tokens.listType.trending")).toBe("熱門");
    expect(runtime.resolve("tokens.listHeader.marketCap")).toBe("市值");
    expect(runtime.resolve("trade.instantTradeAmount")).toBe("快捷交易金額");
  });

  it("exposes the SDK locale runtime contract", async () => {
    const runtime = createApplicationLocaleRuntime("en");
    expect(runtime.normalize("en-US")).toBe("en");
    expect(runtime.resolve("extend.header.home")).toBe("Home");
    await expect(runtime.load("en")).resolves.toBeUndefined();
  });
});
