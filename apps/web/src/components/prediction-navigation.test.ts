import {
  PREDICTION_NAV_ITEMS,
  isPredictionNavItemActive,
  predictionHref,
} from "./prediction-navigation";

describe("prediction navigation", () => {
  it("maps the six visible prediction-template destinations below /predict", () => {
    expect(PREDICTION_NAV_ITEMS).toEqual([
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
    ]);
  });

  it("prefixes prediction-template routes without duplicating the base path", () => {
    expect(predictionHref("/event/world-cup-final?market=winner")).toBe(
      "/predict/event/world-cup-final?market=winner",
    );
    expect(predictionHref("/predict/sports?view=live")).toBe(
      "/predict/sports?view=live",
    );
  });

  it("matches query-backed and nested secondary destinations", () => {
    expect(
      isPredictionNavItemActive(
        "/predict/leaderboard/0xabc",
        PREDICTION_NAV_ITEMS[3],
      ),
    ).toBe(true);
    expect(
      isPredictionNavItemActive(
        "/predict/sports",
        PREDICTION_NAV_ITEMS[0],
      ),
    ).toBe(true);
    expect(
      isPredictionNavItemActive(
        "/predict/esports",
        PREDICTION_NAV_ITEMS[0],
      ),
    ).toBe(false);
  });
});
