"use server";

import { defaultLng, defaultNS, i18next, LocaleCode, LocaleEnum } from "@liberfi.io/i18n/server";
import en from "@liberfi/locales/locales/en/translation.json";
import zh from "@liberfi/locales/locales/zh/translation.json";
import en2 from "@liberfi.io/i18n/locales/en.json";
import zh2 from "@liberfi.io/i18n/locales/zh.json";

let initialized = false;

type TranslationResource = Record<string, unknown>;

function mergeResources(
  base: TranslationResource,
  override: TranslationResource,
): TranslationResource {
  const merged: TranslationResource = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = merged[key];
    if (isPlainObject(baseValue) && isPlainObject(value)) {
      merged[key] = mergeResources(baseValue, value);
      continue;
    }
    merged[key] = value;
  }
  return merged;
}

function isPlainObject(value: unknown): value is TranslationResource {
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
