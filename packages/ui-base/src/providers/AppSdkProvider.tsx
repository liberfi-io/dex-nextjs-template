import { createContext, PropsWithChildren } from "react";
import { IAppSdk } from "@liberfi/core";

/**
 * Register the app sdk adapter
 */
export const AppSdkContext = createContext<IAppSdk>({} as IAppSdk);

export function AppSdkProvider({ appSdk, children }: PropsWithChildren<{ appSdk: IAppSdk }>) {
  return <AppSdkContext.Provider value={appSdk}>{children}</AppSdkContext.Provider>;
}
