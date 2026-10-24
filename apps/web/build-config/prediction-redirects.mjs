export const PREDICTION_REDIRECTS = [
  {
    source: "/predict",
    destination: "/predict/sports",
    permanent: false,
  },
  {
    source: "/predict/matches",
    destination: "/predict/sports",
    permanent: false,
  },
  {
    source: "/world-cup/:path*",
    destination: "/predict/sports",
    permanent: true,
  },
  {
    source: "/predict/world-cup/:path*",
    destination: "/predict/sports",
    permanent: true,
  },
];
