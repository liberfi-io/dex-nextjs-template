"use client";

import { useEffect } from "react";
import { usePredictWsClient } from "@liberfi.io/react-predict";
import { PredictSubNav } from "src/components/PredictSubNav";

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
  // Predict pages (EventsPage / MatchesPage / portfolio) use natural document
  // flow with `min-height: 100vh` + `position: sticky` + IntersectionObserver
  // infinite scroll. The dex template's PageShell wraps content in a fixed
  // viewport-height container with `overflow-hidden`, so we provide our own
  // internal scroll container here. The sub-nav stays pinned at the top while
  // the page content scrolls below it.
  return (
    <div className="flex flex-col h-full">
      <PredictWsConnector />
      <PredictSubNav />
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
    </div>
  );
}
