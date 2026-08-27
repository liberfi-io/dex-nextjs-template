"use client";

import { createContext, type PropsWithChildren, useContext, useMemo } from "react";
import {
  createStage53VenuePorts,
  type Stage53VenuePorts,
} from "./createStage53Adapters";

const Stage53VenueContext = createContext<Stage53VenuePorts | null>(null);

export function Stage53AdaptersProvider({ children }: PropsWithChildren) {
  const ports = useMemo(() => createStage53VenuePorts(), []);
  return (
    <Stage53VenueContext.Provider value={ports}>{children}</Stage53VenueContext.Provider>
  );
}

export function useStage53VenuePorts(): Stage53VenuePorts {
  const ports = useContext(Stage53VenueContext);
  if (!ports) {
    throw new Error("useStage53VenuePorts must be used within Stage53AdaptersProvider");
  }
  return ports;
}
