import { getServerPredictClient } from "../../../libs/server/predictClient";
import type { SportsSsrDeadline } from "../route/sportsSsrDeadline";
import { prefetchSportsPageData } from "./prefetch";

jest.mock("../../../libs/server/predictClient", () => ({
  getServerPredictClient: jest.fn(),
}));

describe("prefetchSportsPageData", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as { fetch?: typeof fetch }).fetch;
    delete (process.env as Record<string, string | undefined>).PREDICT_URL;
  });

  it("marks a timed-out match page as degraded instead of authoritative empty data", async () => {
    process.env.PREDICT_URL = "https://predict.example/";
    jest.mocked(getServerPredictClient).mockReturnValue({
      getSportsTaxonomy: jest.fn().mockResolvedValue(null),
    } as never);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    });
    const timeoutDeadline: SportsSsrDeadline = {
      deadlineAt: 0,
      remainingMs: () => 0,
      withRemainingTimeout: async (op) => {
        const signal = new AbortController().signal;
        const pending = op(signal);
        const url = String(jest.mocked(global.fetch).mock.calls.at(-1)?.[0]);
        if (url.includes("/sports/matches?")) {
          await pending;
          throw new Error("sports ssr deadline exceeded");
        }
        return pending;
      },
    };

    const result = await prefetchSportsPageData({
      section: "sports",
      lang: "en",
      deadline: timeoutDeadline,
      filters: {
        view: "live",
        start_time_gte: "2026-07-23T00:00:00Z",
        start_time_lt: "2026-07-24T00:00:00Z",
      },
    });

    expect(result.matches).toEqual([]);
    expect(result.match_page_degraded).toBe(true);
    expect(result.match_request_time_range).toEqual({
      start_time_gte: "2026-07-23T00:00:00Z",
      start_time_lt: "2026-07-24T00:00:00Z",
    });
  });
});
