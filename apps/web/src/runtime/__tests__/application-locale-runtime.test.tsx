import { createApplicationLocaleRuntime } from "../createApplicationLocaleRuntime";
import { applicationLocaleResources } from "../../application/locales/createApplicationLocaleRuntime";
import { SDK_DOMAIN_LOCALE_ROOTS } from "../../application/locales/roots";

describe("application locale runtime", () => {
  it("combines application strings with SDK-owned canonical aliases", () => {
    const runtime = createApplicationLocaleRuntime("en");
    expect(runtime.i18n.t("extend.header.home")).toBe("Home");
    expect(runtime.i18n.t("trade.buy")).toBe("Buy");
    expect(runtime.i18n.t("extend.trade.buy")).toBe("Buy");
  });

  it("does not flow SDK-owned locale copy back through application resources", () => {
    const runtime = createApplicationLocaleRuntime("en");
    const resources = applicationLocaleResources();
    for (const locale of ["en", "zh"] as const) {
      for (const root of SDK_DOMAIN_LOCALE_ROOTS) {
        expect(resources[locale].extend).not.toHaveProperty(root);
      }
    }

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

  it("exposes the SDK locale runtime contract", async () => {
    const runtime = createApplicationLocaleRuntime("en");
    expect(runtime.normalize("en-US")).toBe("en");
    expect(runtime.resolve("extend.header.home")).toBe("Home");
    await expect(runtime.load("en")).resolves.toBeUndefined();
  });
});
