"use client";

import { useRouter } from "next/navigation";
import { cn } from "@liberfi.io/ui";
import { EventsPage } from "@liberfi.io/ui-predict";

export function PredictListPage() {
  const router = useRouter();

  return (
    <div className={cn("w-full h-full px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto")}>
      <div className="p-2 sm:p-4 w-full h-full max-w-[1550px] mx-auto">
        <EventsPage
          onSelect={(event) => {
            router.push(`/predict/${event.ticker}`);
          }}
          onSelectOutcome={(outcome) => {
            router.push(`/predict/${outcome.ticker}`);
          }}
        />
      </div>
    </div>
  );
}
