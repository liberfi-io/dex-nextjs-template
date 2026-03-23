"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@liberfi.io/ui";
import { EventsPageV2 } from "@liberfi.io/ui-predict";
import type { V2Event, V2Market } from "@liberfi.io/ui-predict";
import { predictEventHref } from "./predict-source";

export function PredictListPageV2() {
  const router = useRouter();

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
      router.prefetch(predictEventHref(event));
    },
    [router],
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
