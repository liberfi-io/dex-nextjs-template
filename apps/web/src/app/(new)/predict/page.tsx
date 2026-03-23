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

  // resolveEventsV2Params() with no args produces the same default params
  // as the client-side useEventsV2 hook's initial render, guaranteeing
  // the prefetched data lands in the same cache slot.
  const params = resolveEventsV2Params();

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
