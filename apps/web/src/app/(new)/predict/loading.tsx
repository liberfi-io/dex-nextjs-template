"use client";

import { cn } from "@liberfi.io/ui";

function Bone({ className }: { className?: string }) {
  return <div className={cn("rounded-md bg-default-200/60", className)} />;
}

function CategoryBar() {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Bone key={i} className="h-8 w-20 shrink-0 rounded-full" />
      ))}
    </div>
  );
}

function Toolbar() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bone className="h-8 w-24 rounded-lg" />
        <Bone className="h-8 w-24 rounded-lg" />
      </div>
      <div className="flex items-center gap-2">
        <Bone className="h-8 w-20 rounded-lg" />
        <Bone className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

function EventCard() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-default-200 bg-content1 p-4">
      <div className="flex items-start gap-3">
        <Bone className="h-12 w-12 shrink-0 rounded-lg" />
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <Bone className="h-3 w-16" />
          <Bone className="h-5 w-full" />
        </div>
      </div>
      <Bone className="h-2 w-full rounded-full" />
      <div className="flex items-center justify-between">
        <Bone className="h-3 w-20" />
        <div className="flex gap-2">
          <Bone className="h-8 w-16 rounded-lg" />
          <Bone className="h-8 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className={cn("w-full h-full px-4 max-sm:px-0 flex flex-col gap-2.5 overflow-y-auto")}>
      <div className="p-2 sm:p-4 w-full h-full max-w-[1550px] mx-auto">
        <div className="flex h-full w-full flex-col gap-y-3 animate-pulse">
          <CategoryBar />
          <Toolbar />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-0 flex-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <EventCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
