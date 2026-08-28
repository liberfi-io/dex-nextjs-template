/**
 * S6-07b option A: send leftover `(legacy)` URLs to the current `(new)` routes.
 * Predict detail used `source="kalshi"` on the old page, so that segment is preserved.
 */
export const LEGACY_REDIRECTS = [
  { source: "/legacy-home", destination: "/", permanent: true },
  { source: "/legacy/account", destination: "/portfolio", permanent: true },
  { source: "/legacy/channels/create", destination: "/channels/create", permanent: true },
  {
    source: "/legacy/channels/:id/update",
    destination: "/channels/:id/update",
    permanent: true,
  },
  { source: "/legacy/channels/:id", destination: "/channels/:id", permanent: true },
  { source: "/legacy/channels", destination: "/channels", permanent: true },
  { source: "/legacy/predict/:id", destination: "/predict/kalshi/:id", permanent: true },
  { source: "/legacy/redpacket/create", destination: "/redpacket/create", permanent: true },
  {
    source: "/legacy/redpacket/histories",
    destination: "/redpacket/histories",
    permanent: true,
  },
  { source: "/legacy/redpacket", destination: "/redpacket", permanent: true },
  { source: "/legacy/tokens/:path*", destination: "/tokens/:path*", permanent: true },
  { source: "/legacy/tokens", destination: "/tokens", permanent: true },
];
