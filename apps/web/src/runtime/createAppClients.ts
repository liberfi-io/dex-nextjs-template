import { ChainStreamClient } from "@chainstream-io/sdk";
import { Client } from "@liberfi.io/client";
import {
  createPredictWsClient,
  PredictClient,
  PredictWsClient,
  PredictWsClientConfig,
} from "@liberfi.io/react-predict";
import { ChannelsClient } from "@liberfi.io/ui-channels/client";
import { MediaTrackClient } from "@liberfi.io/ui-media-track/client";
import { HyperliquidPerpetualsClient, LiberFiPerpDepositClient } from "@liberfi.io/ui-perpetuals";
import { PortfolioClient } from "@liberfi.io/ui-portfolio/client";
import {
  AppClientBundle,
  CapabilityBundleV1,
  RuntimeConfig,
} from "./app-runtime.types";

export type DexTokenProvider = ConstructorParameters<typeof ChainStreamClient>[0];
export type DexRuntimeConfig = Pick<RuntimeConfig, "dexAggregatorUrl">;

export interface DexClientFactories {
  createChainStream(...args: ConstructorParameters<typeof ChainStreamClient>): ChainStreamClient;
  createApi(...args: ConstructorParameters<typeof Client>): Client;
}

const DEFAULT_DEX_CLIENT_FACTORIES: DexClientFactories = {
  createChainStream: (...args) => new ChainStreamClient(...args),
  createApi: (...args) => new Client(...args),
};

export function createDexClients(
  config: DexRuntimeConfig,
  dexTokenProvider: DexTokenProvider,
  factories: DexClientFactories = DEFAULT_DEX_CLIENT_FACTORIES,
): Pick<AppClientBundle, "chainStream" | "api"> {
  return {
    chainStream: factories.createChainStream(dexTokenProvider, {
      serverUrl: config.dexAggregatorUrl,
    }),
    api: factories.createApi(dexTokenProvider, {
      serverUrl: config.dexAggregatorUrl,
    }),
  };
}

export interface MediaTrackClientFactories {
  createMediaTrack(...args: ConstructorParameters<typeof MediaTrackClient>): MediaTrackClient;
}

export type MediaTrackRuntimeConfig = Pick<RuntimeConfig, "mediaTrackUrl" | "mediaTrackStreamUrl">;

const DEFAULT_MEDIA_TRACK_CLIENT_FACTORIES: MediaTrackClientFactories = {
  createMediaTrack: (...args) => new MediaTrackClient(...args),
};

export function createMediaTrackClient(
  config: MediaTrackRuntimeConfig,
  dexTokenProvider: DexTokenProvider,
  factories: MediaTrackClientFactories = DEFAULT_MEDIA_TRACK_CLIENT_FACTORIES,
): MediaTrackClient {
  return factories.createMediaTrack({
    endpoint: config.mediaTrackUrl,
    streamEndpoint: config.mediaTrackStreamUrl,
    accessToken: dexTokenProvider,
  });
}

export type ChannelsTokenProvider = ConstructorParameters<typeof ChannelsClient>[0]["accessToken"];
export type ChannelsRuntimeConfig = Pick<RuntimeConfig, "channelsUrl">;

export interface ChannelsClientFactories {
  createChannels(...args: ConstructorParameters<typeof ChannelsClient>): ChannelsClient;
}

const DEFAULT_CHANNELS_CLIENT_FACTORIES: ChannelsClientFactories = {
  createChannels: (...args) => new ChannelsClient(...args),
};

export function createChannelsClient(
  config: ChannelsRuntimeConfig,
  channelsTokenProvider: ChannelsTokenProvider,
  factories: ChannelsClientFactories = DEFAULT_CHANNELS_CLIENT_FACTORIES,
): ChannelsClient {
  return factories.createChannels({
    endpoint: config.channelsUrl,
    accessToken: channelsTokenProvider,
  });
}

export interface PortfolioClientFactories {
  createPortfolio(...args: ConstructorParameters<typeof PortfolioClient>): PortfolioClient;
}

export type PortfolioRuntimeConfig = Pick<RuntimeConfig, "dexAggregatorUrl">;

const DEFAULT_PORTFOLIO_CLIENT_FACTORIES: PortfolioClientFactories = {
  createPortfolio: (...args) => new PortfolioClient(...args),
};

export function createPortfolioClient(
  config: PortfolioRuntimeConfig,
  factories: PortfolioClientFactories = DEFAULT_PORTFOLIO_CLIENT_FACTORIES,
): PortfolioClient {
  return factories.createPortfolio(config.dexAggregatorUrl);
}

export interface PerpetualsClientFactories {
  createPerpetuals(
    ...args: ConstructorParameters<typeof HyperliquidPerpetualsClient>
  ): HyperliquidPerpetualsClient;
  createPerpetualDeposit(
    ...args: ConstructorParameters<typeof LiberFiPerpDepositClient>
  ): LiberFiPerpDepositClient;
}

export type PerpetualsRuntimeConfig = Pick<
  RuntimeConfig,
  "perpetualsApiUrl" | "perpetualsEnvironment"
>;

const DEFAULT_PERPETUALS_CLIENT_FACTORIES: PerpetualsClientFactories = {
  createPerpetuals: (...args) => new HyperliquidPerpetualsClient(...args),
  createPerpetualDeposit: (...args) => new LiberFiPerpDepositClient(...args),
};

export function createPerpetualsClients(
  config: PerpetualsRuntimeConfig,
  factories: PerpetualsClientFactories = DEFAULT_PERPETUALS_CLIENT_FACTORIES,
): Pick<AppClientBundle, "perpetuals" | "perpetualDeposit"> {
  return {
    perpetuals: factories.createPerpetuals({
      environment: config.perpetualsEnvironment,
    }),
    perpetualDeposit: config.perpetualsApiUrl
      ? factories.createPerpetualDeposit({ baseUrl: config.perpetualsApiUrl })
      : undefined,
  };
}

export interface PredictClientFactories {
  createPredict(endpoint: string): PredictClient;
  createPredictWs(config: PredictWsClientConfig): PredictWsClient;
}

export type PredictRuntimeConfig = Pick<
  RuntimeConfig,
  "predictUrl" | "predictWsEnabled" | "predictWsUrl"
>;

const DEFAULT_PREDICT_CLIENT_FACTORIES: PredictClientFactories = {
  createPredict: (endpoint) => new PredictClient(endpoint),
  createPredictWs: createPredictWsClient,
};

export function createPredictClients(
  config: PredictRuntimeConfig,
  factories: PredictClientFactories = DEFAULT_PREDICT_CLIENT_FACTORIES,
): Pick<AppClientBundle, "predict" | "predictWs"> {
  return {
    predict: factories.createPredict(config.predictUrl),
    predictWs:
      config.predictWsEnabled && config.predictWsUrl
        ? factories.createPredictWs({
            wsUrl: config.predictWsUrl,
            autoConnect: false,
            autoReconnect: true,
          })
        : null,
  };
}

type AppClientMembers = Omit<AppClientBundle, "capabilities">;

export function createCapabilityBundle(api: Client): CapabilityBundleV1 {
  return {
    token: api,
    wallet: api,
    activity: api,
    trade: api,
    transaction: api,
    media: api,
    subscription: { token: api, wallet: api, activity: api },
  };
}

export function createAppClients(
  members: AppClientMembers,
  capabilities = createCapabilityBundle(members.api),
): AppClientBundle {
  const requiredMembers: Array<keyof AppClientMembers> = [
    "chainStream",
    "api",
    "mediaTrack",
    "channels",
    "predict",
    "portfolio",
    "perpetuals",
  ];
  for (const member of requiredMembers) {
    if (!members[member]) {
      throw new Error(`Missing required application client: ${member}`);
    }
  }
  return Object.assign(members, { capabilities });
}
