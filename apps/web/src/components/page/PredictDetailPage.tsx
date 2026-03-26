"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@liberfi.io/ui";
import { EventDetailPageV2, useSimilarEventsV2Query } from "@liberfi.io/ui-predict";
import type { V2ProviderSource } from "@liberfi.io/ui-predict";
import { predictEventHref } from "./predict-source";

export function PredictDetailPage({ id, source }: { id: string; source: V2ProviderSource }) {
  const router = useRouter();

  const { data: similarEvents } = useSimilarEventsV2Query(
    { slug: id, source, limit: 4 },
    { staleTime: Infinity },
  );

  useEffect(() => {
    similarEvents?.forEach((ev) => router.prefetch(predictEventHref(ev)));
  }, [similarEvents, router]);

  const handleSimilarEventClick = useCallback(
    (event: { slug: string; source: V2ProviderSource }) => {
      router.push(predictEventHref(event));
    },
    [router],
  );

  return (
    <div className={cn("w-full h-full px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto")}>
      <div className="p-2 sm:p-4 flex w-full max-w-[1550px] mx-auto">
        <EventDetailPageV2 eventSlug={id} source={source} onSimilarEventClick={handleSimilarEventClick} />
      </div>
    </div>
  );
}
