import { PropsWithChildren, useMemo } from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import { IAppSdk, IRouter, ITranslation } from "@liberfi/core";
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
  const locale = useMemo(() => translation.i18n.language, [translation]);

  const navigate = useMemo(() => router.navigate.bind(router), [router]);

  // monitor screen size changes
  useUpdateLayout();

  // tick every second to hold the current timestamp
  useUpdateTick();

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
