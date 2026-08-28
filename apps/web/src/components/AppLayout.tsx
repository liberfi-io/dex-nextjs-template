"use client";

import { PropsWithChildren, useState } from "react";
import { ServiceClientProviders } from "./ServiceClientProviders";
import { QueryClientProvider } from "@tanstack/react-query";
import { GraphQLClientProvider } from "../application/server/graphql";
import { UIProviders } from "./UIProviders";
import { AuthProviders } from "./AuthProviders";
import { LocaleCode, LocaleProvider } from "@liberfi.io/i18n";
import type { LocaleProviderProps } from "@liberfi.io/i18n";
import type { ComponentType } from "react";
import * as UiScaffold from "@liberfi.io/ui-scaffold";
import { queryClient } from "../libs/queryClient";
import { graphqlClient } from "../libs/graphqlClient";
import {
  applicationLocaleProviderProps,
  createApplicationLocaleRuntime,
  type ApplicationLocaleRuntime,
} from "../runtime/createApplicationLocaleRuntime";

const RuntimeLocaleProvider = LocaleProvider as ComponentType<
  LocaleProviderProps & { runtime?: ApplicationLocaleRuntime }
>;
const ModalCoordinatorProvider = (
  UiScaffold as typeof UiScaffold & {
    ModalCoordinatorProvider: ComponentType<PropsWithChildren>;
  }
).ModalCoordinatorProvider;

export function AppLayout({ children, locale }: PropsWithChildren<{ locale: LocaleCode }>) {
  const [runtime] = useState(() => createApplicationLocaleRuntime(locale));
  return (
    <ModalCoordinatorProvider>
      <QueryClientProvider client={queryClient}>
        <GraphQLClientProvider client={graphqlClient}>
          <AuthProviders>
            <RuntimeLocaleProvider
              {...applicationLocaleProviderProps(runtime)}
              locale={locale}
              supportedLanguages={["en", "zh"]}
            >
              <ServiceClientProviders>
                <UIProviders>{children}</UIProviders>
              </ServiceClientProviders>
            </RuntimeLocaleProvider>
          </AuthProviders>
        </GraphQLClientProvider>
      </QueryClientProvider>
    </ModalCoordinatorProvider>
  );
}
