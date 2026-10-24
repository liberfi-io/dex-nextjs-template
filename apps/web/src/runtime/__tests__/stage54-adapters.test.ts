import fs from "node:fs";
import path from "node:path";
import { createStage54PredictPorts } from "../createStage54Adapters";
import type { PredictClient, PredictWsClient } from "@liberfi.io/react-predict";

const client = { endpoint: "https://predict.example" } as unknown as PredictClient;
const ws = { getStatus: () => "disconnected" } as unknown as PredictWsClient;

describe("createStage54PredictPorts", () => {
  it("keeps WS null when the G2 enable flag is off", () => {
    const ports = createStage54PredictPorts({
      client,
      wsClient: ws,
      wsEnabled: false,
    });
    expect(ports.client).toBe(client);
    expect(ports.wsEnabled).toBe(false);
    expect(ports.wsClient).toBeNull();
  });

  it("passes through a pre-built WS client only when enabled", () => {
    const ports = createStage54PredictPorts({
      client,
      wsClient: ws,
      wsEnabled: true,
    });
    expect(ports.wsClient).toBe(ws);
    expect(ports.wsEnabled).toBe(true);
  });

  it("nests the updated market-data runtime inside the predict provider", () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), "src/runtime/Stage54AdaptersProvider.tsx"),
      "utf8",
    );
    const predictProvider = source.indexOf("<PredictProvider");
    const marketDataProvider = source.indexOf("<MarketDataProvider");
    const predictProviderClose = source.indexOf("</PredictProvider>");

    expect(predictProvider).toBeGreaterThan(-1);
    expect(marketDataProvider).toBeGreaterThan(predictProvider);
    expect(marketDataProvider).toBeLessThan(predictProviderClose);
  });
});
