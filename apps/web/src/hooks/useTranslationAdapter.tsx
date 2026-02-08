"use client";

import { useMemo } from "react";
import { ITranslation, TranslateFunction } from "@liberfi/ui-dex";
import { LocaleEnum, useChangeLocale, useLocale, useTranslation } from "@liberfi.io/i18n";

export function useTranslationAdapter() {
  const { t } = useTranslation();
  const changeLanguage = useChangeLocale();
  const language = useLocale();

  const translation = useMemo<ITranslation>(
    () => ({
      t: t as TranslateFunction,
      i18n: {
        enable: true,
        reloadResources: async () => {},
        changeLanguage,
        language,
        languages: [LocaleEnum.en, LocaleEnum.zh],
      },
    }),
    [t, language, changeLanguage],
  );

  return translation;
}
