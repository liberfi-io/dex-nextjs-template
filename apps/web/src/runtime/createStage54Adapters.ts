import type { PredictClient, PredictWsClient } from "@liberfi.io/react-predict";

export type Stage54PredictPorts = {
  client: PredictClient;
  wsClient: PredictWsClient | null;
  wsEnabled: boolean;
};

/**
 * Template-owned prediction ports. WS stays off unless the G2 env
 * policy already constructed a client (`wsEnabled && wsClient`).
 * Unpublished SDK order-intent runtime is not imported until the
 * Stage 5.4 package is consumed.
 */
export function createStage54PredictPorts(input: {
  client: PredictClient;
  wsClient: PredictWsClient | null;
  wsEnabled: boolean;
}): Stage54PredictPorts {
  return {
    client: input.client,
    wsEnabled: input.wsEnabled,
    wsClient: input.wsEnabled ? input.wsClient : null,
  };
}
