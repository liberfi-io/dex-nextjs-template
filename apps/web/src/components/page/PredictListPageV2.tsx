"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@liberfi.io/ui";
import {
  EventsPageV2,
  eventByIdQueryKey,
  fetchEventById,
  usePredictClient,
} from "@liberfi.io/ui-predict";
import type { V2Event, V2Market } from "@liberfi.io/ui-predict";

export function PredictListPageV2() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const predictClient = usePredictClient();

  const handleSelect = (event: V2Event) => {
    router.push(`/predict/${event.slug}`);
  };

  const handleSelectOutcome = (
    event: V2Event,
    _market: V2Market,
    _side: "yes" | "no",
  ) => {
    router.push(`/predict/${event.slug}`);
  };

  const handleHover = useCallback(
    (event: V2Event) => {
      queryClient.prefetchQuery({
        queryKey: eventByIdQueryKey({
          id: event.slug,
          withNestedMarkets: true,
        }),
        queryFn: () =>
          fetchEventById(predictClient, {
            id: event.slug,
            withNestedMarkets: true,
          }),
        staleTime: 30_000,
      });
    },
    [queryClient, predictClient],
  );

  return (
    <div className={cn("w-full h-full px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto")}>
      <div className="p-2 sm:p-4 w-full h-full max-w-[1550px] mx-auto">
        <EventsPageV2
          getEventHref={(event: V2Event) => `/predict/${event.slug}`}
          LinkComponent={Link as React.ComponentType<{ href: string; children: React.ReactNode }>}
          onHover={handleHover}
          onSelect={handleSelect}
          onSelectOutcome={handleSelectOutcome}
        />
      </div>
    </div>
  );
}
