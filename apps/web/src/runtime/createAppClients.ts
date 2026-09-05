import { ChainStreamClient } from "@chainstream-io/sdk";
import { Client } from "@liberfi.io/client";
import { ChannelsClient } from "@liberfi.io/ui-channels/client";
import { MediaTrackClient } from "@liberfi.io/ui-media-track/client";
import { CoreAppClientBundle, CapabilityBundleV1, RuntimeConfig } from "./app-runtime.types";

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
): Pick<CoreAppClientBundle, "chainStream" | "api"> {
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

type AppClientMembers = Omit<CoreAppClientBundle, "capabilities">;

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
): CoreAppClientBundle {
  const requiredMembers: Array<keyof AppClientMembers> = ["chainStream", "api", "mediaTrack"];
  for (const member of requiredMembers) {
    if (!members[member]) {
      throw new Error(`Missing required application client: ${member}`);
    }
  }
  return Object.assign(members, { capabilities });
}
