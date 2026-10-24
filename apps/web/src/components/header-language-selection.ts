import { parseI18nLang, type Language, type LocaleCode } from "@liberfi.io/i18n";

export function resolveHeaderLanguageOption(
  locale: LocaleCode,
  languages: Language[],
): LocaleCode {
  return parseI18nLang(
    locale,
    languages.map((language) => language.localCode),
  );
}
