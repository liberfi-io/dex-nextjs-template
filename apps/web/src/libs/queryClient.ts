import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      // Disable reconnect-driven refetches by default. For
      // perpetuals data we rely on Hyperliquid's `webData2`
      // WebSocket push to refresh state on reconnect — firing a
      // fan of REST queries on every network blip would burn
      // through HL's 1200 weight/min IP budget and trigger the
      // 429s we're trying to avoid. Per-query overrides remain
      // available where polling is the only option.
      refetchOnReconnect: false,
    },
  },
});
