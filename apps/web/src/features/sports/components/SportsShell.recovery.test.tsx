import { render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { SportsShell } from "./SportsShell";

jest.mock("../i18n/LocalizedTaxonomyLabel", () => ({
  LocalizedTaxonomyLabel: ({ node }: { node: { slug: string } }) => (
    <span>{node.slug}</span>
  ),
}));

jest.mock("../../worldcup/odds/OddsNumber", () => ({
  OddsNumber: ({ value }: { value: string | number }) => <span>{value}</span>,
}));

describe("SportsShell degraded-page recovery", () => {
  const originalResizeObserver = global.ResizeObserver;

  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as typeof ResizeObserver;
  });

  afterAll(() => {
    global.ResizeObserver = originalResizeObserver;
  });

  it("retries an aborted Strict Mode recovery with the original SSR range", async () => {
    const originalFetch = global.fetch;
    const recoveredResponse = {
      ok: true,
      json: async () => ({
        items: [
          {
            match_group_slug: "recovered-match",
            section: "sports",
            title: "Recovered match",
            start_time: "2026-07-23T12:00:00Z",
          },
        ],
        has_more: false,
        next_cursor: null,
        limit: 20,
      }),
    };
    const fetchMock = jest
      .fn()
      .mockImplementationOnce(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(new DOMException("Aborted", "AbortError"));
            });
          }),
      )
      .mockResolvedValue(recoveredResponse);
    global.fetch = fetchMock;

    try {
      render(
        <StrictMode>
          <SportsShell
            section="sports"
            filters={{
              view: "live",
              start_time_gte: "2026-07-23T00:00:00Z",
              start_time_lt: "2026-07-24T00:00:00Z",
              live_range_start: "2026-07-23T00:00:00Z",
            }}
            lang="en"
            data={{
              matches: [],
              props: [],
              taxonomy: null,
              match_page_degraded: true,
              match_request_time_range: {
                start_time_gte: "2026-07-23T01:00:00Z",
                start_time_lt: "2026-07-24T01:00:00Z",
              },
            }}
          />
        </StrictMode>,
      );

      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
      await waitFor(() =>
        expect(screen.queryByText("extend.leaderboard.loading")).toBeNull(),
      );
      const request = new URL(String(fetchMock.mock.calls[1]?.[0]));
      expect(request.pathname).toBe("/predict-api/api/v1/sports/matches");
      expect(request.searchParams.get("view")).toBe("live");
      expect(request.searchParams.get("start_time_gte")).toBe(
        "2026-07-23T01:00:00Z",
      );
      expect(request.searchParams.get("start_time_lt")).toBe(
        "2026-07-24T01:00:00Z",
      );
    } finally {
      global.fetch = originalFetch;
    }
  });
});
