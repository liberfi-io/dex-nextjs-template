"use client";

import { PropsWithChildren, useState } from "react";
import { ServiceClientProviders } from "./ServiceClientProviders";
import { QueryClientProvider } from "@tanstack/react-query";
import { GraphQLClientProvider } from "@liberfi/react-backend";
import { UIProviders } from "./UIProviders";
import { AuthProviders } from "./AuthProviders";
import { LocaleCode, LocaleProvider } from "@liberfi.io/i18n";
import type { LocaleProviderProps } from "@liberfi.io/i18n";
import type { ComponentType } from "react";
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

export function AppLayout({ children, locale }: PropsWithChildren<{ locale: LocaleCode }>) {
  const [runtime] = useState(() => createApplicationLocaleRuntime(locale));
  return (
    <RuntimeLocaleProvider
      {...applicationLocaleProviderProps(runtime)}
      locale={locale}
      supportedLanguages={["en", "zh"]}
    >
      <QueryClientProvider client={queryClient}>
        <GraphQLClientProvider client={graphqlClient}>
          <AuthProviders>
            <ServiceClientProviders>
              <UIProviders>{children}</UIProviders>
            </ServiceClientProviders>
          </AuthProviders>
        </GraphQLClientProvider>
      </QueryClientProvider>
    </RuntimeLocaleProvider>
  );
}
