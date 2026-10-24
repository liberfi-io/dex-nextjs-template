import type { ReactNode } from "react";

export const DEFAULT_DISCOVER_TOKEN_LIST_HEIGHT = 600;

function resolveTokenListHeight(height?: number): number {
  return height && height > 0 ? height : DEFAULT_DISCOVER_TOKEN_LIST_HEIGHT;
}

export function DiscoverTokenListMeasurementGate({
  height,
  children,
}: {
  height?: number;
  children: (height: number) => ReactNode;
}) {
  return children(resolveTokenListHeight(height));
}
