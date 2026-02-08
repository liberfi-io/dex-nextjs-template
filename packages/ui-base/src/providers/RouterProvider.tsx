import { createContext, PropsWithChildren } from "react";
import { IRouter } from "@liberfi/core";

/**
 * Register the router adapter
 */
export const RouterContext = createContext<IRouter>({} as IRouter);

export function RouterProvider({ router, children }: PropsWithChildren<{ router: IRouter }>) {
  return <RouterContext.Provider value={router}>{children}</RouterContext.Provider>;
}
