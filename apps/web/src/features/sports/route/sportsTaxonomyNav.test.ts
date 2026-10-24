import type { SportsTaxonomyNode } from "../types";
import { sportsLiveHref, taxonomyHref } from "./sportsTaxonomyNav";

describe("prediction sports navigation", () => {
  const node: SportsTaxonomyNode = {
    section: "sports",
    node_type: "league",
    slug: "epl",
    label: "Premier League",
  };

  it("keeps taxonomy links inside the host prediction namespace", () => {
    expect(taxonomyHref("sports", node)).toBe(
      "/predict/sports?taxonomy_type=league&taxonomy_slug=epl",
    );
    expect(
      taxonomyHref("esports", {
        ...node,
        section: "esports",
        node_type: "game",
        slug: "league-of-legends",
      }),
    ).toBe(
      "/predict/esports?taxonomy_type=game&taxonomy_slug=league-of-legends",
    );
  });

  it("keeps live filters inside the host prediction namespace", () => {
    expect(
      sportsLiveHref(
        "sports",
        {
          start_time_gte: "2026-09-01T00:00:00Z",
          start_time_lt: "2026-09-02T00:00:00Z",
        },
        "2026-09-01T00:00:00Z",
      ),
    ).toBe(
      "/predict/sports?view=live&start_time_gte=2026-09-01T00%3A00%3A00Z&start_time_lt=2026-09-02T00%3A00%3A00Z&live_range_start=2026-09-01T00%3A00%3A00Z",
    );
  });
});
