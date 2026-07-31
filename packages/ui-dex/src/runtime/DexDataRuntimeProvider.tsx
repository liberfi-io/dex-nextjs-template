import { PropsWithChildren, createContext, useContext, useEffect, useMemo } from "react";
import { QueryClient } from "@tanstack/react-query";
import { ChainStreamDexDataAdapter } from "./ChainStreamDexDataAdapter";
import { DexDataRuntime, DexDataScheduler } from "./DexDataRuntime";

const DexDataRuntimeContext = createContext<DexDataRuntime | null>(null);

export interface DexDataRuntimeProviderProps extends PropsWithChildren {
  queryClient: QueryClient;
  adapter: ChainStreamDexDataAdapter;
  scheduler?: DexDataScheduler;
}

export function DexDataRuntimeProvider({
  children,
  queryClient,
  adapter,
  scheduler,
}: DexDataRuntimeProviderProps) {
  const runtime = useMemo(
    () => new DexDataRuntime(queryClient, adapter, scheduler),
    [adapter, queryClient, scheduler],
  );

  useEffect(() => () => runtime.dispose(), [runtime]);

  return (
    <DexDataRuntimeContext.Provider value={runtime}>{children}</DexDataRuntimeContext.Provider>
  );
}

export function useDexDataRuntime(): DexDataRuntime {
  const runtime = useContext(DexDataRuntimeContext);
  if (!runtime) throw new Error("DexDataRuntimeProvider is required");
  return runtime;
}
