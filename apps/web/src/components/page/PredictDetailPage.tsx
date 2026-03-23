"use client";

import { cn } from "@liberfi.io/ui";
import { EventDetailPageV2 } from "@liberfi.io/ui-predict";
import type { V2ProviderSource } from "@liberfi.io/ui-predict";

export function PredictDetailPage({ id, source }: { id: string; source: V2ProviderSource }) {
  return (
    <div className={cn("w-full h-full px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto")}>
      <div className="p-2 sm:p-4 flex w-full max-w-[1550px] mx-auto">
        <EventDetailPageV2 eventSlug={id} source={source} />
      </div>
    </div>
  );
}
