import { DiscoverTokenListSkeleton } from "./DiscoverTokenListSkeleton";

export type ViewListTokenListSkeletonProps = {
  rows?: number;
  layout?: "desktop" | "mobile";
};

export function ViewListTokenListSkeleton({ rows, layout }: ViewListTokenListSkeletonProps) {
  return <DiscoverTokenListSkeleton rows={rows} layout={layout} />;
}
