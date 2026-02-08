"use client";

import { PropsWithChildren } from "react";
import { ServiceClientProviders } from "./ServiceClientProviders";
import { QueryClientProvider } from "@tanstack/react-query";
import { GraphQLClientProvider } from "@liberfi/react-backend";
import { UIProviders } from "./UIProviders";
import { AuthProviders } from "./AuthProviders";
import { LocaleCode, LocaleProvider } from "@liberfi.io/i18n";
import { queryClient } from "@/libs/queryClient";
import { graphqlClient } from "@/libs/graphqlClient";
import en from "@liberfi/locales/locales/en/translation.json";
import zh from "@liberfi/locales/locales/zh/translation.json";
import en2 from "@liberfi.io/i18n/locales/en.json";
import zh2 from "@liberfi.io/i18n/locales/zh.json";

export function AppLayout({ children, locale }: PropsWithChildren<{ locale: LocaleCode }>) {
  return (
    <LocaleProvider
      locale={locale}
      supportedLanguages={["en", "zh"]}
      resources={{
        en: { ...en, ...en2 },
        zh: { ...zh, ...zh2 },
      }}
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
    </LocaleProvider>
  );
}
