"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LinkComponentType } from "@liberfi.io/ui";
import { EventsPageV2 } from "@liberfi.io/ui-predict";
import type { V2Event, V2Market } from "@liberfi.io/ui-predict";
import { predictEventHref } from "./predict-source";

const NoPrefetchLink: LinkComponentType = (props) => <Link prefetch={false} {...props} />;

export function PredictListPageV2() {
  const router = useRouter();

  const handleSelect = (event: V2Event) => {
    router.push(predictEventHref(event));
  };

  const handleSelectOutcome = (event: V2Event, _market: V2Market, _side: "yes" | "no") => {
    router.push(predictEventHref(event));
  };

  const handleHover = useCallback(
    (event: V2Event) => {
      router.prefetch(predictEventHref(event));
    },
    [router],
  );

  return (
    <div className="flex px-1 py-1 sm:px-0 sm:py-4 max-w-[1680px] mx-auto w-full h-full">
      <EventsPageV2
        getEventHref={(event: V2Event) => predictEventHref(event)}
        LinkComponent={NoPrefetchLink}
        onHover={handleHover}
        onSelect={handleSelect}
        onSelectOutcome={handleSelectOutcome}
      />
    </div>
  );
}
