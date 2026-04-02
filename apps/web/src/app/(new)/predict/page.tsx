import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  resolveEventsParams,
  infiniteEventsQueryKey,
  fetchEventsPage,
} from "@liberfi.io/react-predict/server";
import { getServerPredictClient } from "src/libs/server/predictClient";
import { createServerQueryClient } from "src/libs/server/queryClient";
import { PredictListPageV2 } from "src/components/page/PredictListPageV2";

export default async function Page() {
  const queryClient = createServerQueryClient();
  const client = getServerPredictClient();

  // Must match the client-side defaults in EventsPage:
  //   DEFAULT_FILTER_STATE.source = "kalshi"
  //   SORT_PRESETS["trending"]    = { sort_by: "volume_24h", sort_asc: false }
  const params = resolveEventsParams({
    source: "kalshi",
    sort_by: "volume_24h",
    sort_asc: false,
  });

  // Race the prefetch against a 3 s timeout so a slow prediction backend
  // never blocks the server response. On timeout the page still renders and
  // the client fetches the data itself.
  await Promise.race([
    queryClient.prefetchInfiniteQuery({
      queryKey: infiniteEventsQueryKey(params),
      queryFn: ({ pageParam }) =>
        fetchEventsPage(client, {
          ...params,
          ...(pageParam ? { cursor: pageParam } : {}),
        }),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage: { has_more?: boolean; next_cursor?: string }) =>
        lastPage.has_more && lastPage.next_cursor
          ? lastPage.next_cursor
          : undefined,
      pages: 1,
    }),
    new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error("prefetch timeout")), 3000),
    ),
  ]).catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PredictListPageV2 />
    </HydrationBoundary>
  );
}
