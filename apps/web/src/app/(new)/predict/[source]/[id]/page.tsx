import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { fetchEvent, eventQueryKey } from "@liberfi.io/react-predict/server";
import { getServerPredictClient } from "src/libs/server/predictClient";
import { createServerQueryClient } from "src/libs/server/queryClient";
import { PredictDetailPage } from "../../../../../components/page/PredictDetailPage";
import { toApiSource } from "../../../../../components/page/predict-source";

interface PageProps {
  params: Promise<{ source: string; id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { source, id } = await params;
  const apiSource = toApiSource(source);

  const queryClient = createServerQueryClient();
  const client = getServerPredictClient();

  // Race the prefetch against a 3 s timeout so a slow prediction backend
  // never blocks the server response. On timeout the page still renders and
  // the client fetches the data itself.
  await Promise.race([
    queryClient.prefetchQuery({
      queryKey: eventQueryKey(id, apiSource),
      queryFn: () => fetchEvent(client, id, apiSource),
    }),
    new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error("prefetch timeout")), 3000),
    ),
  ]).catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PredictDetailPage id={id} source={apiSource} />
    </HydrationBoundary>
  );
}
