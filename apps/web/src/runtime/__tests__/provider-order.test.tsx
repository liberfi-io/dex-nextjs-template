import {
  APP_RUNTIME_PROVIDER_ORDER,
  validateRuntimeProviderOrder,
} from "../runtime-lifecycle-policy";

describe("application provider order policy", () => {
  it("places data runtime outside data consumers", () => {
    expect(APP_RUNTIME_PROVIDER_ORDER).toEqual([
      "query-client",
      "auth",
      "locale",
      "app-runtime",
      "pinata",
      "application-adapters",
      "chainstream-client",
      "api-client",
      "media-track",
      "channels",
      "predict",
      "polymarket",
      "portfolio-client",
      "portfolio-account",
      "perpetuals",
      "dex-data-runtime",
      "dex-data",
      "application-shell",
    ]);
    expect(validateRuntimeProviderOrder(APP_RUNTIME_PROVIDER_ORDER)).toBe(true);
  });

  it("rejects data consumers outside their runtime provider", () => {
    const invalidOrder = [...APP_RUNTIME_PROVIDER_ORDER];
    const runtimeIndex = invalidOrder.indexOf("dex-data-runtime");
    const dataIndex = invalidOrder.indexOf("dex-data");
    [invalidOrder[runtimeIndex], invalidOrder[dataIndex]] = [
      invalidOrder[dataIndex],
      invalidOrder[runtimeIndex],
    ];

    expect(validateRuntimeProviderOrder(invalidOrder)).toBe(false);
  });
});
