import {
  markHomepageCriticalPath,
  observeHomepageFirstTokenRow,
  recordHomepageRankingResourceTiming,
  resetHomepageCriticalPathForTests,
} from "./homepageCriticalPath";

describe("homepage critical-path instrumentation", () => {
  const mark = jest.fn();

  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    mark.mockReset();
    Object.defineProperty(window.performance, "mark", {
      configurable: true,
      value: mark,
    });
    resetHomepageCriticalPathForTests();
  });

  it("records allowlisted details once without copying request data", () => {
    markHomepageCriticalPath("dex_request_end", {
      source: "grant",
      status: 200,
      durationMs: 412.8,
    });
    markHomepageCriticalPath("dex_request_end", {
      source: "l1",
      status: 200,
      durationMs: 1,
    });

    expect(mark).toHaveBeenCalledTimes(1);
    expect(mark).toHaveBeenCalledWith(
      "liberfi:homepage:dex_request_end",
      expect.objectContaining({
        detail: expect.objectContaining({
          source: "grant",
          status: 200,
          durationMs: 413,
        }),
      }),
    );
    expect(JSON.stringify(mark.mock.calls)).not.toContain("cookie");
    expect(JSON.stringify(mark.mock.calls)).not.toContain("token");
  });

  it("ignores non-home routes", () => {
    window.history.replaceState({}, "", "/tokens/sol/example");

    markHomepageCriticalPath("hydration_executable");

    expect(mark).not.toHaveBeenCalled();
  });

  it("never interrupts rendering when the Performance Timeline is unavailable", () => {
    Object.defineProperty(window.performance, "mark", {
      configurable: true,
      value: undefined,
    });

    expect(() =>
      markHomepageCriticalPath("hydration_executable"),
    ).not.toThrow();
  });

  it("projects a ranking resource into start, response and end marks", () => {
    recordHomepageRankingResourceTiming({
      name: "https://app.liberfi.io/dex-api/v2/ranking/sol/hotTokens/24h?view=summary",
      startTime: 120,
      responseStart: 340,
      responseEnd: 510,
    });

    expect(mark.mock.calls.map(([name]) => name)).toEqual([
      "liberfi:homepage:ranking_request_start",
      "liberfi:homepage:ranking_response_start",
      "liberfi:homepage:ranking_request_end",
    ]);
    expect(mark.mock.calls[0]?.[1]).toMatchObject({ startTime: 120 });
    expect(mark.mock.calls[1]?.[1]).toMatchObject({ startTime: 340 });
    expect(mark.mock.calls[2]?.[1]).toMatchObject({ startTime: 510 });
    expect(JSON.stringify(mark.mock.calls)).not.toContain("app.liberfi.io");
  });

  it("marks the first real table row and reports the rendered row count", async () => {
    const root = document.createElement("div");
    root.innerHTML = "<div data-skeleton></div><table><tbody></tbody></table>";
    const stop = observeHomepageFirstTokenRow(root);

    root.querySelector("tbody")?.append(document.createElement("tr"));
    await Promise.resolve();

    expect(mark).toHaveBeenCalledWith(
      "liberfi:homepage:first_row_visible",
      expect.objectContaining({
        detail: expect.objectContaining({ rowCount: 1 }),
      }),
    );
    stop();
  });
});
