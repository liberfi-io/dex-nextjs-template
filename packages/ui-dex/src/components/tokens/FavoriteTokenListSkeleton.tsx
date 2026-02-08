import { DiscoverTokenListSkeleton } from "./DiscoverTokenListSkeleton";

export type FavoriteTokenListSkeletonProps = {
  rows?: number;
  layout?: "desktop" | "mobile";
};

export function FavoriteTokenListSkeleton({ rows, layout }: FavoriteTokenListSkeletonProps) {
  return <DiscoverTokenListSkeleton rows={rows} layout={layout} />;
}
