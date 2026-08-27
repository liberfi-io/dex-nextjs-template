"use client";

import { createContext, type PropsWithChildren, useContext, useMemo } from "react";
import type { ChainStreamClient } from "@chainstream-io/sdk";
import {
  createStage55Adapters,
  type Stage55Adapters,
} from "./createStage55Adapters";

const Stage55AdaptersContext = createContext<Stage55Adapters | null>(null);

export interface Stage55AdaptersProviderProps extends PropsWithChildren {
  client: ChainStreamClient;
  origin: string;
}

export function Stage55AdaptersProvider({
  client,
  origin,
  children,
}: Stage55AdaptersProviderProps) {
  const adapters = useMemo(
    () => createStage55Adapters({ client, origin }),
    [client, origin],
  );
  return (
    <Stage55AdaptersContext.Provider value={adapters}>
      {children}
    </Stage55AdaptersContext.Provider>
  );
}

export function useStage55Adapters(): Stage55Adapters {
  const adapters = useContext(Stage55AdaptersContext);
  if (!adapters) {
    throw new Error("useStage55Adapters must be used within Stage55AdaptersProvider");
  }
  return adapters;
}
