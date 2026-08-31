"use server";

import * as sdkI18nServer from "@liberfi.io/i18n/server";
import {
  defaultLng,
  defaultNS,
  en,
  i18next,
  LocaleCode,
  LocaleEnum,
} from "@liberfi.io/i18n/server";

const zh = (sdkI18nServer as typeof sdkI18nServer & { zh: typeof en }).zh;

let initialized = false;

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
        [defaultNS]: en,
      },
      [LocaleEnum.zh]: {
        [defaultNS]: zh,
      },
    },
  });

  initialized = true;
  return i18next;
}
