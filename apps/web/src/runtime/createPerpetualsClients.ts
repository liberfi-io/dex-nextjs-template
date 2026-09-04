import {
  HyperliquidPerpetualsClient,
  LiberFiPerpDepositClient,
} from "@liberfi.io/ui-perpetuals";
import { PerpetualsAppClientBundle, RuntimeConfig } from "./app-runtime.types";

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
): PerpetualsAppClientBundle {
  return {
    perpetuals: factories.createPerpetuals({
      environment: config.perpetualsEnvironment,
    }),
    perpetualDeposit: config.perpetualsApiUrl
      ? factories.createPerpetualDeposit({ baseUrl: config.perpetualsApiUrl })
      : undefined,
  };
}
