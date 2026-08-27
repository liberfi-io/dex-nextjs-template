"use client";

import { createContext, useContext, useMemo, type PropsWithChildren } from "react";
import type { Client } from "@liberfi.io/client";
import {
  createStage51Adapters,
  type Stage51Adapters,
} from "./createStage51Adapters";

const Stage51AdaptersContext = createContext<Stage51Adapters | null>(null);

export interface Stage51AdaptersProviderProps extends PropsWithChildren {
  api: Client;
}

export function Stage51AdaptersProvider({
  api,
  children,
}: Stage51AdaptersProviderProps) {
  const adapters = useMemo(() => createStage51Adapters(api), [api]);
  return (
    <Stage51AdaptersContext.Provider value={adapters}>
      {children}
    </Stage51AdaptersContext.Provider>
  );
}

export function useStage51Adapters(): Stage51Adapters {
  const value = useContext(Stage51AdaptersContext);
  if (!value) {
    throw new Error("useStage51Adapters must be used within Stage51AdaptersProvider");
  }
  return value;
}
