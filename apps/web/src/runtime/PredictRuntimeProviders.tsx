"use client";

import { PropsWithChildren, useMemo } from "react";
import { PolymarketProvider } from "@liberfi.io/react-predict";
import { PredictWalletProvider } from "@liberfi.io/ui-predict";
import { DeferredAsyncModalHost } from "../components/modals/DeferredAsyncModalHost";
import { MARKET_DATA_FEATURE_CAPABILITY } from "../libs/featureFlags";
import { createMarketDataCentrifugoTransportFactory } from "../libs/marketDataCentrifugoClient";
import { createPredictClients } from "./createPredictClients";
import { Stage54AdaptersProvider } from "./Stage54AdaptersProvider";
import { useAppRuntimeConfig } from "./AppRuntimeProviders";

export function PredictRuntimeProviders({ children }: PropsWithChildren) {
  const config = useAppRuntimeConfig();
  const clients = useMemo(
    () =>
      createPredictClients({
        predictUrl: config.predictUrl,
        predictWsEnabled: config.predictWsEnabled,
        predictWsUrl: config.predictWsUrl,
      }),
    [config.predictUrl, config.predictWsEnabled, config.predictWsUrl],
  );
  const marketDataTransportFactory = useMemo(() => {
    const endpoint = process.env.NEXT_PUBLIC_CENTRIFUGO_WS_URL;
    if (!MARKET_DATA_FEATURE_CAPABILITY.enabled || !endpoint) {
      return undefined;
    }
    return createMarketDataCentrifugoTransportFactory({ endpoint });
  }, []);

  return (
    <Stage54AdaptersProvider
      client={clients.predict}
      wsClient={clients.predictWs}
      wsEnabled={config.predictWsEnabled}
      marketDataCapability={MARKET_DATA_FEATURE_CAPABILITY}
      marketDataTransportFactory={marketDataTransportFactory}
    >
      <PolymarketProvider>
        <PredictWalletProvider enabled>
          <DeferredAsyncModalHost>{children}</DeferredAsyncModalHost>
        </PredictWalletProvider>
      </PolymarketProvider>
    </Stage54AdaptersProvider>
  );
}
