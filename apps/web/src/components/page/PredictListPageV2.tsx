"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@liberfi.io/ui";
import {
  EventsPageV2,
  eventV2QueryKey,
  fetchEventV2,
  usePredictV2Client,
} from "@liberfi.io/ui-predict";
import type { V2Event, V2Market } from "@liberfi.io/ui-predict";
import { predictEventHref } from "./predict-source";

export function PredictListPageV2() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const v2Client = usePredictV2Client();

  const handleSelect = (event: V2Event) => {
    router.push(predictEventHref(event));
  };

  const handleSelectOutcome = (
    event: V2Event,
    _market: V2Market,
    _side: "yes" | "no",
  ) => {
    router.push(predictEventHref(event));
  };

  const handleHover = useCallback(
    (event: V2Event) => {
      queryClient.prefetchQuery({
        queryKey: eventV2QueryKey(event.slug, event.source),
        queryFn: () => fetchEventV2(v2Client, event.slug, event.source),
        staleTime: 30_000,
      });
    },
    [queryClient, v2Client],
  );

  return (
    <div className={cn("w-full h-full px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto")}>
      <div className="p-2 sm:p-4 w-full h-full max-w-[1550px] mx-auto">
        <EventsPageV2
          getEventHref={(event: V2Event) => predictEventHref(event)}
          LinkComponent={Link as React.ComponentType<{ href: string; children: React.ReactNode }>}
          onHover={handleHover}
          onSelect={handleSelect}
          onSelectOutcome={handleSelectOutcome}
        />
      </div>
    </div>
  );
}
