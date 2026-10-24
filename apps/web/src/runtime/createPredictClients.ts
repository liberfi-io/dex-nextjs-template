import { predictApiHeaders } from "src/libs/predictApiHeaders";
import {
  createPredictWsClient,
  PredictClient,
  PredictWsClient,
  PredictWsClientConfig,
} from "@liberfi.io/react-predict";
import { PredictAppClientBundle, RuntimeConfig } from "./app-runtime.types";

export interface PredictClientFactories {
  createPredict(endpoint: string): PredictClient;
  createPredictWs(config: PredictWsClientConfig): PredictWsClient;
}

export type PredictRuntimeConfig = Pick<
  RuntimeConfig,
  "predictUrl" | "predictWsEnabled" | "predictWsUrl"
>;

const DEFAULT_PREDICT_CLIENT_FACTORIES: PredictClientFactories = {
  createPredict: (endpoint) => new PredictClient(endpoint, { headers: () => predictApiHeaders() }),
  createPredictWs: (config) => createPredictWsClient({ ...config, apiKey: () => process.env.NEXT_PUBLIC_PREDICT_API_KEY ?? "" }),
};

export function createPredictClients(
  config: PredictRuntimeConfig,
  factories: PredictClientFactories = DEFAULT_PREDICT_CLIENT_FACTORIES,
): PredictAppClientBundle {
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
