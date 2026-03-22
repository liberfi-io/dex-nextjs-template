"use client";

import { useRouter } from "next/navigation";
import { cn } from "@liberfi.io/ui";
import { EventsPageV2 } from "@liberfi.io/ui-predict";
import type { V2Event, V2Market } from "@liberfi.io/ui-predict";

export function PredictListPageV2() {
  const router = useRouter();

  const handleSelect = (event: V2Event) => {
    router.push(`/predict/${event.slug}`);
  };

  const handleSelectOutcome = (event: V2Event, _market: V2Market, _side: "yes" | "no") => {
    router.push(`/predict/${event.slug}`);
  };

  return (
    <div className={cn("w-full h-full px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto")}>
      <div className="p-2 sm:p-4 w-full h-full max-w-[1550px] mx-auto">
        <EventsPageV2 onSelect={handleSelect} onSelectOutcome={handleSelectOutcome} />
      </div>
    </div>
  );
}
