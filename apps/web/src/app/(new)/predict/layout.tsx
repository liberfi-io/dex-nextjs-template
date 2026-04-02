"use client";

import { useEffect } from "react";
import { usePredictWsClient } from "@liberfi.io/react-predict";

/**
 * Connects the prediction WebSocket when the user enters any /predict route
 * and disconnects when they leave. This keeps the WS connection scoped to
 * the predict section instead of being open on every page.
 *
 * Note: PredictWalletProvider lives in the root layout (NewAppLayout →
 * ServiceProviders) so the header's PredictAccountButton can also access it.
 */
function PredictWsConnector() {
  const { wsClient } = usePredictWsClient();

  useEffect(() => {
    if (!wsClient) return;
    wsClient.connect();
    return () => {
      wsClient.disconnect();
    };
  }, [wsClient]);

  return null;
}

export default function PredictLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PredictWsConnector />
      {children}
    </>
  );
}
