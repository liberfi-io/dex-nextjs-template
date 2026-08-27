import {
  getExchangeClient,
  getInfoClient,
} from "../lib/hyperliquid/client";

export type Stage53VenuePorts = {
  getInfoClient: typeof getInfoClient;
  getExchangeClient: typeof getExchangeClient;
};

export function createStage53VenuePorts(): Stage53VenuePorts {
  return {
    getInfoClient,
    getExchangeClient,
  };
}
