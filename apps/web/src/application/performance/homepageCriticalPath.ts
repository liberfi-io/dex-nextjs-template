"use client";

export type HomepageCriticalPathEvent =
  | "hydration_executable"
  | "dex_request_start"
  | "dex_request_end"
  | "get_token_resolve"
  | "get_token_reject"
  | "ranking_request_start"
  | "ranking_response_start"
  | "ranking_request_end"
  | "first_row_visible";

export type HomepageCriticalPathDetails = {
  source?: "cookie" | "l1" | "grant" | "error" | "unknown";
  status?: number;
  durationMs?: number;
  rowCount?: number;
};

type RankingResourceTiming = Pick<
  PerformanceResourceTiming,
  "name" | "startTime" | "responseStart" | "responseEnd"
>;

const MARK_PREFIX = "liberfi:homepage:";
const rankingUrlPattern = /\/v2\/ranking\/[^/]+\/hotTokens\/[^/?]+/;
const recordedEvents = new Set<HomepageCriticalPathEvent>();

function isHomepageNavigation() {
  if (typeof window === "undefined") return false;
  return window.location.pathname === "/" || window.location.pathname === "/discover";
}

function normalizeDetails(details: HomepageCriticalPathDetails) {
  return {
    ...(details.source ? { source: details.source } : {}),
    ...(typeof details.status === "number" ? { status: details.status } : {}),
    ...(typeof details.durationMs === "number"
      ? { durationMs: Math.round(details.durationMs) }
      : {}),
    ...(typeof details.rowCount === "number"
      ? { rowCount: details.rowCount }
      : {}),
  };
}

function queueAnalyticsEvent(
  event: HomepageCriticalPathEvent,
  details: HomepageCriticalPathDetails,
) {
  try {
    const dataLayer = (window.dataLayer ??= []);
    dataLayer.push(
      [
        "event",
        "homepage_critical_path",
        {
          phase: event,
          elapsed_ms: Math.round(window.performance?.now?.() ?? 0),
          ...normalizeDetails(details),
        },
      ] as never,
    );
  } catch {
    // Observability must never interrupt page rendering or data loading.
  }
}

export function markHomepageCriticalPath(
  event: HomepageCriticalPathEvent,
  details: HomepageCriticalPathDetails = {},
  startTime?: number,
) {
  if (!isHomepageNavigation() || recordedEvents.has(event)) return;

  recordedEvents.add(event);
  const normalizedDetails = normalizeDetails(details);
  try {
    window.performance?.mark?.(`${MARK_PREFIX}${event}`, {
      ...(typeof startTime === "number" ? { startTime } : {}),
      detail: normalizedDetails,
    });
  } catch {
    // Older and embedded browsers may not implement mark options.
  }
  queueAnalyticsEvent(event, normalizedDetails);
}

export function recordHomepageRankingResourceTiming(
  entry: RankingResourceTiming,
) {
  if (!rankingUrlPattern.test(entry.name)) return;

  markHomepageCriticalPath("ranking_request_start", {}, entry.startTime);
  markHomepageCriticalPath(
    "ranking_response_start",
    {},
    entry.responseStart,
  );
  markHomepageCriticalPath("ranking_request_end", {}, entry.responseEnd);
}

export function observeHomepageRankingResources() {
  if (!isHomepageNavigation() || typeof PerformanceObserver === "undefined") {
    return () => undefined;
  }

  if (typeof window.performance?.getEntriesByType !== "function") {
    return () => undefined;
  }

  window.performance
    .getEntriesByType("resource")
    .forEach((entry) => recordHomepageRankingResourceTiming(entry as PerformanceResourceTiming));

  const observer = new PerformanceObserver((list) => {
    list
      .getEntries()
      .forEach((entry) =>
        recordHomepageRankingResourceTiming(entry as PerformanceResourceTiming),
      );
  });
  observer.observe({ type: "resource", buffered: true });

  return () => observer.disconnect();
}

export function observeHomepageFirstTokenRow(root: HTMLElement | null) {
  if (!root || !isHomepageNavigation()) return () => undefined;

  const recordIfReady = () => {
    const rows = root.querySelectorAll("tbody tr");
    if (rows.length === 0) return;
    markHomepageCriticalPath("first_row_visible", { rowCount: rows.length });
    observer.disconnect();
  };

  const observer = new MutationObserver(recordIfReady);
  observer.observe(root, { childList: true, subtree: true });
  recordIfReady();

  return () => observer.disconnect();
}

export function resetHomepageCriticalPathForTests() {
  recordedEvents.clear();
}
