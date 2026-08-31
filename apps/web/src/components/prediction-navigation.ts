export type PredictionNavKey =
  | "sports"
  | "esports"
  | "markets"
  | "leaderboard"
  | "portfolio"
  | "referral";

export type PredictionNavItem = {
  key: PredictionNavKey;
  href: string;
  match?: string;
};

export const PREDICTION_NAV_ITEMS: PredictionNavItem[] = [
  { key: "sports", href: "/predict/sports" },
  { key: "esports", href: "/predict/esports" },
  { key: "markets", href: "/predict/events" },
  {
    key: "leaderboard",
    href: "/predict/leaderboard?interval=7d",
    match: "/predict/leaderboard",
  },
  { key: "portfolio", href: "/predict/portfolio" },
  { key: "referral", href: "/predict/referral" },
];

export function predictionHref(href: string): string {
  if (href === "/predict" || href.startsWith("/predict/")) return href;
  return `/predict${href.startsWith("/") ? href : `/${href}`}`;
}

export function isPredictionNavItemActive(
  pathname: string,
  item: PredictionNavItem,
): boolean {
  const match = item.match ?? item.href.split("?")[0];
  return pathname === match || pathname.startsWith(`${match}/`);
}
