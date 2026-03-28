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

  await queryClient.prefetchQuery({
    queryKey: eventQueryKey(id, apiSource),
    queryFn: () => fetchEvent(client, id, apiSource),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PredictDetailPage id={id} source={apiSource} />
    </HydrationBoundary>
  );
}
