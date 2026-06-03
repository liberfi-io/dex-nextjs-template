"use server";

import { defaultLng, defaultNS, i18next, LocaleCode, LocaleEnum } from "@liberfi.io/i18n/server";
import en from "@liberfi/locales/locales/en/translation.json";
import zh from "@liberfi/locales/locales/zh/translation.json";
import en2 from "@liberfi.io/i18n/locales/en.json";
import zh2 from "@liberfi.io/i18n/locales/zh.json";

let initialized = false;

type FlatTranslationResource = Record<string, string>;
interface NestedTranslationResource {
  [key: string]: string | NestedTranslationResource;
}

function mergeResources(
  base: FlatTranslationResource,
  override: NestedTranslationResource,
): FlatTranslationResource {
  return { ...base, ...flattenResource(override) };
}

function flattenResource(
  resource: NestedTranslationResource,
  prefix = "",
): FlatTranslationResource {
  const flattened: FlatTranslationResource = {};
  for (const [key, value] of Object.entries(resource)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      Object.assign(flattened, flattenResource(value, nextKey));
      continue;
    }
    flattened[nextKey] = value;
  }
  return flattened;
}

function isPlainObject(value: unknown): value is NestedTranslationResource {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function initServerI18n(lang: LocaleCode) {
  if (initialized) return i18next;

  await i18next.init({
    lng: lang,
    fallbackLng: defaultLng,
    supportedLngs: [LocaleEnum.en, LocaleEnum.zh],
    ns: [defaultNS],
    defaultNS,
    initImmediate: false,
    resources: {
      [LocaleEnum.en]: {
        [defaultNS]: mergeResources(en2, en),
      },
      [LocaleEnum.zh]: {
        [defaultNS]: mergeResources(zh2, zh),
      },
    },
  });

  initialized = true;
  return i18next;
}
