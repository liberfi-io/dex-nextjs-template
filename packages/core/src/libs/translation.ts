/**
 * Translation interfaces
 */
export type TranslateFunction = (
  text: string,
  variables?: Record<string, string | number>,
) => string;

export interface ITranslationClient {
  enable: boolean;
  reloadResources: (langs: string[]) => Promise<void>;
  changeLanguage: (lang: string) => Promise<void>;
  language: string;
  languages: string[];
}

export interface ITranslation {
  t: TranslateFunction;
  i18n: ITranslationClient;
}
