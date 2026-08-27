"use client";

import { createContext, type PropsWithChildren, useContext, useMemo } from "react";
import type { PredictClient, PredictWsClient } from "@liberfi.io/react-predict";
import { PredictProvider } from "@liberfi.io/react-predict";
import {
  createStage54PredictPorts,
  type Stage54PredictPorts,
} from "./createStage54Adapters";

const Stage54PredictContext = createContext<Stage54PredictPorts | null>(null);

export interface Stage54AdaptersProviderProps extends PropsWithChildren {
  client: PredictClient;
  wsClient: PredictWsClient | null;
  wsEnabled: boolean;
}

export function Stage54AdaptersProvider({
  client,
  wsClient,
  wsEnabled,
  children,
}: Stage54AdaptersProviderProps) {
  const ports = useMemo(
    () => createStage54PredictPorts({ client, wsClient, wsEnabled }),
    [client, wsClient, wsEnabled],
  );
  return (
    <Stage54PredictContext.Provider value={ports}>
      <PredictProvider client={ports.client} wsClient={ports.wsClient}>
        {children}
      </PredictProvider>
    </Stage54PredictContext.Provider>
  );
}

export function useStage54PredictPorts(): Stage54PredictPorts {
  const ports = useContext(Stage54PredictContext);
  if (!ports) {
    throw new Error("useStage54PredictPorts must be used within Stage54AdaptersProvider");
  }
  return ports;
}
