"use client";

import { cn } from "@liberfi.io/ui";
import { EventDetailPage } from "@liberfi.io/ui-predict";

export function PredictDetailPage({ id }: { id: string }) {
  return (
    <div className={cn("w-full h-full px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto")}>
      <div className="p-2 sm:p-4 flex w-full max-w-[1550px] mx-auto">
        <EventDetailPage eventId={id} />
      </div>
    </div>
  );
}
