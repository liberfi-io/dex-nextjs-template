import { Listbox, ListboxItem, Skeleton } from "@heroui/react";
import {
  AgeSkeleton,
  ContractSkeleton,
  HoldersSkeleton,
  MarketCapSkeleton,
  PriceSkeleton,
  SocialMediaSkeleton,
  TokenSkeleton,
  ViewListSkeleton,
  VolumeSkeleton,
} from "./skeletons";
import clsx from "clsx";
import { ListField } from "../ListField";
import { useAtomValue } from "jotai";
import { layoutAtom } from "@liberfi/ui-base";

export type DiscoverTokenListSkeletonProps = {
  rows?: number;
  layout?: "desktop" | "mobile";
};

export function DiscoverTokenListSkeleton({ layout, rows = 6 }: DiscoverTokenListSkeletonProps) {
  const appLayout = useAtomValue(layoutAtom);

  return (
    <Listbox className="w-full overflow-x-hidden" classNames={{ base: "p-0 pb-4", list: "gap-0" }}>
      {[...Array(rows)].map((_, it) => (
        <ListboxItem
          key={`discover-token-list-skeleton-${it}`}
          className={clsx(
            "rounded-none p-0",
            "data-[hover=true]:bg-transparent",
            "data-[selectable=true]:focus:bg-transparent",
          )}
        >
          {layout !== "mobile" && appLayout === "desktop" ? (
            <DesktopSkeleton />
          ) : (
            <MobileSkeleton />
          )}
        </ListboxItem>
      ))}
    </Listbox>
  );
}

function DesktopSkeleton() {
  return (
    <div className="max-lg:hidden w-full h-14 flex items-center justify-between gap-1 rounded-lg">
      <ViewListSkeleton />
      <TokenSkeleton />
      <PriceSkeleton />
      <MarketCapSkeleton />
      <HoldersSkeleton />
      <VolumeSkeleton />
      <ContractSkeleton className="max-xl:hidden" />
      <AgeSkeleton className="max-xl:hidden" />
      <SocialMediaSkeleton className="max-xl:hidden" />
    </div>
  );
}

function MobileSkeleton() {
  return (
    <div className="w-full h-14 flex items-center justify-between rounded-lg">
      <ListField className="mr-8 basis-0" grow shrink>
        <Skeleton className="w-full h-8 rounded-lg" />
      </ListField>
      <ListField grow={false} width={80} className="pr-2">
        <Skeleton className="w-full h-8 rounded-lg" />
      </ListField>
      <ListField width={32} grow={false}>
        <Skeleton className="w-8 h-8 rounded-lg" />
      </ListField>
    </div>
  );
}
