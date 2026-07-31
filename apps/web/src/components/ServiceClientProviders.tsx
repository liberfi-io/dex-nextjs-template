"use client";

import { PropsWithChildren } from "react";
import { AppRuntimeProviders } from "../runtime/AppRuntimeProviders";

/**
 * @deprecated Use AppRuntimeProviders at the application composition root.
 */
export function ServiceClientProviders({ children }: PropsWithChildren) {
  return <AppRuntimeProviders>{children}</AppRuntimeProviders>;
}
