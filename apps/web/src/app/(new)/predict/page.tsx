import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  resolveEventsV2Params,
  eventsV2InfiniteQueryKey,
  fetchEventsV2Page,
} from "@liberfi.io/ui-predict/server";
import { getServerPredictV2Client } from "src/libs/server/predictClient";
import { createServerQueryClient } from "src/libs/server/queryClient";
import { PredictListPageV2 } from "src/components/page/PredictListPageV2";

export default async function Page() {
  const queryClient = createServerQueryClient();
  const client = getServerPredictV2Client();

  // Must match the client-side defaults in EventsPageV2:
  //   DEFAULT_FILTER_STATE.source = "dflow"
  //   SORT_PRESETS["trending"]    = { sort_by: "volume_24h", sort_asc: false }
  const params = resolveEventsV2Params({
    source: "dflow",
    sort_by: "volume_24h",
    sort_asc: false,
  });

  await queryClient.prefetchInfiniteQuery({
    queryKey: eventsV2InfiniteQueryKey(params),
    queryFn: ({ pageParam }) =>
      fetchEventsV2Page(client, {
        ...params,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: { has_more?: boolean; next_cursor?: string }) =>
      lastPage.has_more && lastPage.next_cursor
        ? lastPage.next_cursor
        : undefined,
    pages: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PredictListPageV2 />
    </HydrationBoundary>
  );
}
