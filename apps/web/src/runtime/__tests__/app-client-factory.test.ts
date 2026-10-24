import { ChainStreamClient } from "@chainstream-io/sdk";
import { Client } from "@liberfi.io/client";
import { createPredictWsClient, PredictClient } from "@liberfi.io/react-predict";
import { ChannelsClient } from "@liberfi.io/ui-channels/client";
import { MediaTrackClient } from "@liberfi.io/ui-media-track/client";
import { HyperliquidPerpetualsClient, LiberFiPerpDepositClient } from "@liberfi.io/ui-perpetuals";
import { CoreAppClientBundle, RuntimeConfig } from "../app-runtime.types";
import {
  createAppClients,
  createChannelsClient,
  createDexClients,
  createMediaTrackClient,
} from "../createAppClients";
import { createPerpetualsClients } from "../createPerpetualsClients";
import { createPredictClients } from "../createPredictClients";

const CONFIG: RuntimeConfig = {
  origin: "https://app.example.com",
  dexAggregatorUrl: "https://app.example.com/dex-api",
  mediaTrackUrl: "https://app.example.com/media-api",
  mediaTrackStreamUrl: "wss://stream.example.com",
  channelsUrl: "https://app.example.com/channels-api",
  predictUrl: "https://app.example.com/predict-api",
  predictWsUrl: undefined,
  predictWsEnabled: false,
  perpetualsApiUrl: undefined,
  perpetualsEnvironment: "mainnet",
};

describe("application client factory", () => {
  it("constructs both dex clients from one token provider and keeps portfolio data on ChainStream", () => {
    const tokenProvider = { getToken: async () => "dex-token" };
    const createChainStream = jest.fn(
      (...args: ConstructorParameters<typeof ChainStreamClient>) => new ChainStreamClient(...args),
    );
    const createApi = jest.fn(
      (...args: ConstructorParameters<typeof Client>) => new Client(...args),
    );

    createDexClients(CONFIG, tokenProvider, { createChainStream, createApi });

    expect(createChainStream).toHaveBeenCalledWith(tokenProvider, {
      serverUrl: CONFIG.dexAggregatorUrl,
    });
    expect(createApi).toHaveBeenCalledWith(tokenProvider, {
      serverUrl: CONFIG.dexAggregatorUrl,
    });
  });

  it("keeps Predict WS absent while the application policy is disabled", () => {
    const createPredict = jest.fn((endpoint: string) => new PredictClient(endpoint));
    const createPredictWs = jest.fn(createPredictWsClient);

    const result = createPredictClients(CONFIG, { createPredict, createPredictWs });

    expect(createPredict).toHaveBeenCalledWith(CONFIG.predictUrl);
    expect(createPredictWs).not.toHaveBeenCalled();
    expect(result.predictWs).toBeNull();
  });

  it("constructs media and Channels clients from their narrow dependencies", () => {
    const dexTokenProvider = { getToken: async () => "dex-token" };
    const channelsTokenProvider = { getToken: async () => "channels-token" };
    const createMediaTrack = jest.fn(
      (...args: ConstructorParameters<typeof MediaTrackClient>) => new MediaTrackClient(...args),
    );
    const createChannels = jest.fn(
      (...args: ConstructorParameters<typeof ChannelsClient>) => new ChannelsClient(...args),
    );

    createMediaTrackClient(CONFIG, dexTokenProvider, { createMediaTrack });
    createChannelsClient(CONFIG, channelsTokenProvider, { createChannels });

    expect(createMediaTrack).toHaveBeenCalledWith({
      endpoint: CONFIG.mediaTrackUrl,
      streamEndpoint: CONFIG.mediaTrackStreamUrl,
      accessToken: dexTokenProvider,
    });
    expect(createChannels).toHaveBeenCalledWith({
      endpoint: CONFIG.channelsUrl,
      accessToken: channelsTokenProvider,
    });
  });

  it("constructs perpetuals clients inside their route-owned factory", () => {
    const createPerpetuals = jest.fn(
      (...args: ConstructorParameters<typeof HyperliquidPerpetualsClient>) =>
        new HyperliquidPerpetualsClient(...args),
    );
    const perpetualDeposit = Object.create(
      LiberFiPerpDepositClient.prototype,
    ) as LiberFiPerpDepositClient;
    const createPerpetualDeposit = jest.fn(
      (_config: ConstructorParameters<typeof LiberFiPerpDepositClient>[0]) => perpetualDeposit,
    );
    const configured = {
      ...CONFIG,
      perpetualsApiUrl: "https://app.example.com/perpetuals-api",
    };

    createPerpetualsClients(configured, {
      createPerpetuals,
      createPerpetualDeposit,
    });

    expect(createPerpetuals).toHaveBeenCalledWith({ environment: "mainnet" });
    expect(createPerpetualDeposit).toHaveBeenCalledWith({
      baseUrl: configured.perpetualsApiUrl,
    });
  });

  it("creates Predict WS only with lazy connection options when enabled", () => {
    const createPredict = jest.fn((endpoint: string) => new PredictClient(endpoint));
    const createPredictWs = jest.fn(createPredictWsClient);
    const configured = {
      ...CONFIG,
      predictWsEnabled: true,
      predictWsUrl: "wss://predict.example.com",
    };

    const result = createPredictClients(configured, { createPredict, createPredictWs });

    expect(createPredictWs).toHaveBeenCalledWith({
      wsUrl: configured.predictWsUrl,
      autoConnect: false,
      autoReconnect: true,
    });
    expect(result.predictWs).not.toBeNull();
  });

  it("assembles one bundle without copying client instances", () => {
    const dexTokenProvider = { getToken: async () => "dex-token" };
    const members = {
      ...createDexClients(CONFIG, dexTokenProvider),
      mediaTrack: createMediaTrackClient(CONFIG, dexTokenProvider),
    };

    const bundle = createAppClients(members);

    expect(bundle).toBe(members);
    expect(bundle.chainStream).toBe(members.chainStream);
    expect(Object.keys(bundle.capabilities)).toEqual([
      "token",
      "wallet",
      "activity",
      "trade",
      "transaction",
      "media",
      "subscription",
    ]);
    expect(bundle.capabilities.token).toBe(members.api);
    expect(bundle.capabilities.subscription.token).toBe(members.api);
    expect(Object.values(bundle.capabilities)).not.toContain(bundle.chainStream);
  });

  it("rejects a missing required bundle member by name", () => {
    expect(() => createAppClients({ api: undefined } as unknown as CoreAppClientBundle)).toThrow(
      "Missing required application client: chainStream",
    );
  });
});
