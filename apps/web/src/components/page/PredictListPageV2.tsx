"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LinkComponentType } from "@liberfi.io/ui";
import { EventsPage } from "@liberfi.io/ui-predict";
import type { PredictEvent } from "@liberfi.io/react-predict";
import { predictEventHref } from "./predict-source";

const NoPrefetchLink: LinkComponentType = (props) => <Link prefetch={false} {...props} />;

export function PredictListPageV2() {
  const router = useRouter();

  const handleSelect = (event: PredictEvent) => {
    router.push(predictEventHref(event));
  };

  const handleHover = useCallback(
    (event: PredictEvent) => {
      router.prefetch(predictEventHref(event));
    },
    [router],
  );

  return (
    <div className="relative w-full h-full">
      {/* Hero background layer */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 280,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <img
          src="/matches-bg-wide.png"
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            opacity: 0.3,
            mixBlendMode: "lighten",
            maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
          }}
        />
        <div className="dot-grid" />
      </div>
      <div className="relative z-[1] flex px-1 py-1 sm:px-0 sm:py-4 max-w-[1680px] mx-auto w-full h-full">
        <EventsPage
          getEventHref={(event: PredictEvent) => predictEventHref(event)}
          LinkComponent={NoPrefetchLink}
          onHover={handleHover}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
