import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import { IAppSdk, IRouter, ITranslation } from "@liberfi/core";
import { useDexClient } from "@liberfi/react-dex";
import { dexClientSubject, queryClientSubject } from "../states";
import { useUpdateLayout, useUpdateTick } from "../hooks";
import { CustomToaster } from "../components";
import { AppSdkProvider } from "./AppSdkProvider";
import { RouterProvider } from "./RouterProvider";
import { TranslationProvider } from "./TranslationProvider";

export type UIKitProviderProps = PropsWithChildren<{
  // translation adapter
  translation: ITranslation;
  // router adapter
  router: IRouter;
  // application features sdk
  appSdk: IAppSdk;
}>;

/**
 * The root provider for the UIKit.
 */
export function UIKitProvider({ translation, router, appSdk, children }: UIKitProviderProps) {
  // sync queryClient state for non-hooks usage
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClientSubject.next(queryClient);
  }, [queryClient]);

  // sync dexClient state for non-hooks usage
  const dexClient = useDexClient();
  useEffect(() => {
    dexClientSubject.next(dexClient);
  }, [dexClient]);

  const locale = useMemo(() => translation.i18n.language, [translation]);

  const navigate = useMemo(() => router.navigate.bind(router), [router]);

  // monitor screen size changes
  useUpdateLayout();

  // tick every second to hold the current timestamp
  useUpdateTick();

  // wait for subjects to be ready
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setTimeout(() => setReady(true));
  }, []);

  if (!ready) return <></>;

  return (
    <TranslationProvider translation={translation}>
      <RouterProvider router={router}>
        <AppSdkProvider appSdk={appSdk}>
          <HeroUIProvider locale={locale} navigate={navigate}>
            <ThemeProvider attribute="class" defaultTheme="dark">
              <CustomToaster />
              {children}
            </ThemeProvider>
          </HeroUIProvider>
        </AppSdkProvider>
      </RouterProvider>
    </TranslationProvider>
  );
}
