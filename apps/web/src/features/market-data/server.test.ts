import { mergeSportsPageDataWithMarketDataHydration } from "./server";

describe("sports market data SSR hydration", () => {
  it("clears a degraded match result when hydration has an authoritative page", () => {
    const result = mergeSportsPageDataWithMarketDataHydration(
      {
        taxonomy: null,
        matches: [],
        props: [],
        match_page_degraded: true,
        match_request_time_range: {
          start_time_gte: "2026-07-23T00:00:00Z",
          start_time_lt: "2026-07-24T00:00:00Z",
        },
      },
      {
        resources: {},
        pages: {
          matches: {
            items: [
              {
                match_group_slug: "hydrated-match",
                section: "sports",
                title: "Hydrated match",
              },
            ],
            has_more: false,
            limit: 20,
          },
        },
      },
    );

    expect(result.matches).toHaveLength(1);
    expect(result.match_page_degraded).toBeUndefined();
    expect(result.match_request_time_range).toBeUndefined();
  });
});
