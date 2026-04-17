"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LinkComponentType } from "@liberfi.io/ui";
import { MatchesPage } from "@liberfi.io/ui-predict";
import type {
  MatchMarketFlat,
  ProviderSource,
} from "@liberfi.io/react-predict";
import { predictEventHref } from "./predict-source";

const NoPrefetchLink: LinkComponentType = (props) => (
  <Link prefetch={false} {...props} />
);

function hrefForMatchSide(
  match: MatchMarketFlat,
  source: ProviderSource,
): string | undefined {
  const market = source === match.source_a ? match.market_a : match.market_b;
  if (market?.event_slug) {
    return predictEventHref({ slug: market.event_slug, source });
  }
  return undefined;
}

export function PredictMatchesPage() {
  const router = useRouter();

  const handleSelect = useCallback(
    (match: MatchMarketFlat, source: ProviderSource) => {
      const href = hrefForMatchSide(match, source);
      if (href) router.push(href);
    },
    [router],
  );

  const getMarketHref = useCallback(
    (match: MatchMarketFlat, source: ProviderSource) =>
      hrefForMatchSide(match, source),
    [],
  );

  const handleHover = useCallback(
    (match: MatchMarketFlat) => {
      const hrefA = hrefForMatchSide(match, match.source_a);
      const hrefB = hrefForMatchSide(match, match.source_b);
      if (hrefA) router.prefetch(hrefA);
      if (hrefB && hrefB !== hrefA) router.prefetch(hrefB);
    },
    [router],
  );

  return (
    <MatchesPage
      onSelect={handleSelect}
      onHover={handleHover}
      getMarketHref={getMarketHref}
      LinkComponent={NoPrefetchLink}
      bgImageSrc="/matches-bg-wide.png"
    />
  );
}
