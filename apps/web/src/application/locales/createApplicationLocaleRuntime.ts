import * as I18nSdk from "@liberfi.io/i18n";
import type { LocaleCode, LocaleProviderProps } from "@liberfi.io/i18n";
import { installLegacyLocaleAliases } from "./legacy-aliases";
import { legacySdkShapedDomainResources } from "./legacy-domain-resources";
import en from "./en.json";
import zh from "./zh.json";

export interface ApplicationLocaleRuntime {
  i18n: {
    language: string;
    t(key: string): string;
    getResourceBundle(locale: string, namespace: string): unknown;
    addResourceBundle(
      locale: string,
      namespace: string,
      resources: unknown,
      deep: boolean,
      overwrite: boolean,
    ): void;
  };
  change(locale: LocaleCode): Promise<void>;
}

const createLocaleRuntime = (
  I18nSdk as typeof I18nSdk & {
    createLocaleRuntime?: (options: unknown) => ApplicationLocaleRuntime;
  }
).createLocaleRuntime;

function cloneResource<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function applicationLocaleResources() {
  return {
    en: cloneResource(en),
    zh: cloneResource(zh),
  };
}

export function applicationLocaleProviderProps(runtime: ApplicationLocaleRuntime) {
  const resources = applicationLocaleResources();
  return createLocaleRuntime
    ? { runtime }
    : {
        resources: {
          en: { ...legacySdkShapedDomainResources.en, extend: resources.en.extend },
          zh: { ...legacySdkShapedDomainResources.zh, extend: resources.zh.extend },
        } as LocaleProviderProps["resources"],
      };
}

/** Create one application-owned locale runtime for a layout root. */
export function createApplicationLocaleRuntime(locale: LocaleCode) {
  const resources = applicationLocaleResources();
  const runtime = createLocaleRuntime
    ? createLocaleRuntime({ locale, resources })
    : createLegacyApplicationLocaleRuntime(locale);
  installLegacyLocaleAliases(runtime, "en");
  installLegacyLocaleAliases(runtime, "zh");
  return runtime;
}

function createLegacyApplicationLocaleRuntime(locale: LocaleCode): ApplicationLocaleRuntime {
  const i18n = I18nSdk.createInstance();
  const sdkEn = (I18nSdk as { en?: Record<string, unknown> }).en ?? {};
  const sdkZh = (I18nSdk as { zh?: Record<string, unknown> }).zh ?? {};
  void i18n.init({
    lng: locale,
    fallbackLng: "en",
    initImmediate: false,
    resources: {
      en: {
        translation: {
          ...sdkEn,
          ...legacySdkShapedDomainResources.en,
          extend: cloneResource(en.extend),
        },
      },
      zh: {
        translation: {
          ...sdkZh,
          ...legacySdkShapedDomainResources.zh,
          extend: cloneResource(zh.extend),
        },
      },
    },
  });
  return {
    i18n: {
      get language() {
        return i18n.language;
      },
      t: (key) => i18n.t(key as never),
      getResourceBundle: (language, namespace) => i18n.getResourceBundle(language, namespace),
      addResourceBundle: (language, namespace, resource, deep, overwrite) =>
        i18n.addResourceBundle(language, namespace, resource, deep, overwrite),
    },
    change: async (nextLocale) => {
      await i18n.changeLanguage(nextLocale);
    },
  };
}
