import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { fetchEventV2, eventV2QueryKey } from "@liberfi.io/ui-predict/server";
import { getServerPredictV2Client } from "src/libs/server/predictClient";
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
  const client = getServerPredictV2Client();

  await queryClient.prefetchQuery({
    queryKey: eventV2QueryKey(id, apiSource),
    queryFn: () => fetchEventV2(client, id, apiSource),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PredictDetailPage id={id} source={apiSource} />
    </HydrationBoundary>
  );
}
