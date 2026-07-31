import * as I18nSdk from "@liberfi.io/i18n";
import type { LocaleCode, LocaleProviderProps } from "@liberfi.io/i18n";
import {
  installLegacyLocaleAliases,
  legacySdkCompatibilityResource,
} from "@liberfi/locales/legacy-aliases";
import en from "@liberfi/locales/en";
import zh from "@liberfi/locales/zh";

const applicationRoots = [
  "title", "description", "languages", "header", "footer", "auth",
  "network", "nav", "toolbar", "settings", "common", "search",
] as const;

export interface ApplicationLocaleRuntime {
  i18n: {
    language: string;
    t(key: string): string;
    getResourceBundle(locale: string, namespace: string): unknown;
    addResourceBundle(locale: string, namespace: string, resources: unknown, deep: boolean, overwrite: boolean): void;
  };
  change(locale: LocaleCode): Promise<void>;
}

const createLocaleRuntime = (
  I18nSdk as typeof I18nSdk & {
    createLocaleRuntime?: (options: unknown) => ApplicationLocaleRuntime;
  }
).createLocaleRuntime;

export function applicationLocaleProviderProps(
  runtime: ApplicationLocaleRuntime,
) {
  return createLocaleRuntime
    ? { runtime }
    : {
        resources: {
          en: legacySdkCompatibilityResource(en),
          zh: legacySdkCompatibilityResource(zh),
        } as LocaleProviderProps["resources"],
      };
}

function applicationResource(resource: { extend: Record<string, unknown> }) {
  return {
    extend: Object.fromEntries(
      applicationRoots.map((root) => [root, resource.extend[root]]),
    ),
  };
}

/** Create one application-owned locale runtime for a layout root. */
export function createApplicationLocaleRuntime(locale: LocaleCode) {
  const resources = {
    en: applicationResource(en),
    zh: applicationResource(zh),
  };
  const runtime = createLocaleRuntime
    ? createLocaleRuntime({ locale, resources })
    : createLegacyApplicationLocaleRuntime(locale);
  installLegacyLocaleAliases(runtime, "en");
  installLegacyLocaleAliases(runtime, "zh");
  return runtime;
}

function createLegacyApplicationLocaleRuntime(
  locale: LocaleCode,
): ApplicationLocaleRuntime {
  const i18n = I18nSdk.createInstance();
  void i18n.init({
    lng: locale,
    fallbackLng: "en",
    initImmediate: false,
    resources: {
      en: { translation: legacySdkCompatibilityResource(en) },
      zh: { translation: legacySdkCompatibilityResource(zh) },
    },
  });
  return {
    i18n: {
      get language() {
        return i18n.language;
      },
      t: (key) => i18n.t(key as never),
      getResourceBundle: (language, namespace) =>
        i18n.getResourceBundle(language, namespace),
      addResourceBundle: (language, namespace, resource, deep, overwrite) =>
        i18n.addResourceBundle(
          language,
          namespace,
          resource,
          deep,
          overwrite,
        ),
    },
    change: async (nextLocale) => {
      await i18n.changeLanguage(nextLocale);
    },
  };
}
