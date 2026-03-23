import type { V2ProviderSource } from "@liberfi.io/ui-predict";

export type DisplaySource = "kalshi" | "polymarket";

const DISPLAY_TO_API: Record<DisplaySource, V2ProviderSource> = {
  kalshi: "dflow",
  polymarket: "polymarket",
};

const API_TO_DISPLAY: Record<V2ProviderSource, DisplaySource> = {
  dflow: "kalshi",
  polymarket: "polymarket",
};

export function toApiSource(display: string): V2ProviderSource {
  return DISPLAY_TO_API[display as DisplaySource] ?? (display as V2ProviderSource);
}

export function toDisplaySource(api: V2ProviderSource): DisplaySource {
  return API_TO_DISPLAY[api] ?? (api as DisplaySource);
}

export function predictEventHref(event: { slug: string; source: V2ProviderSource }): string {
  return `/predict/${toDisplaySource(event.source)}/${event.slug}`;
}
