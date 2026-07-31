import { createApplicationLocaleRuntime } from "../createApplicationLocaleRuntime";

describe("application locale runtime", () => {
  it("combines application strings with SDK-owned canonical aliases", () => {
    const runtime = createApplicationLocaleRuntime("en");
    expect(runtime.i18n.t("extend.header.home")).toBe("Home");
    expect(runtime.i18n.t("trade.buy")).toBe("Buy");
    expect(runtime.i18n.t("extend.trade.buy")).toBe("Buy");
  });

  it("creates isolated layout instances", async () => {
    const first = createApplicationLocaleRuntime("en");
    const second = createApplicationLocaleRuntime("en");
    await first.change("zh");
    expect(first.i18n.language).not.toBe(second.i18n.language);
  });
});
