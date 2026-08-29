import {
  createLocaleRuntime,
  type LocaleCode,
  type LocaleRuntime,
  type Resources,
} from "@liberfi.io/i18n";
import { installLegacyLocaleAliases } from "./legacy-aliases";
import en from "./en.json";
import zh from "./zh.json";

export type ApplicationLocaleRuntime = LocaleRuntime;

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
  return { runtime };
}

/** Create one application-owned locale runtime for a layout root. */
export function createApplicationLocaleRuntime(locale: LocaleCode) {
  const resources = applicationLocaleResources() as Resources;
  const runtime = createLocaleRuntime({ locale, resources });
  installLegacyLocaleAliases(runtime, "en");
  installLegacyLocaleAliases(runtime, "zh");
  return runtime;
}
