"use client";

import { PropsWithChildren } from "react";
import { UIKitProvider } from "@liberfi/ui-base";
import { useTranslationAdapter } from "@/hooks/useTranslationAdapter";
import { useRouterAdapter } from "@/hooks/useRouterAdapter";
import { browserAppSdk } from "@/libs/browser/BrowserAppSdk";
import { Modals } from "./Modals";
import { BottomNavigationBar, DexDataProvider, Header } from "@liberfi/ui-dex";
import { BottomToolBar } from "./BottomToolBar";
import { Page } from "./Page";

export function UIProviders({ children }: PropsWithChildren) {
  const translation = useTranslationAdapter();

  const router = useRouterAdapter();

  return (
    <UIKitProvider translation={translation} router={router} appSdk={browserAppSdk}>
      <DexDataProvider>
        <Page
          bottomNavigationBar={<BottomNavigationBar />}
          header={<Header />}
          bottomToolBar={<BottomToolBar />}
        >
          {children}
        </Page>
        <Modals />
      </DexDataProvider>
    </UIKitProvider>
  );
}
