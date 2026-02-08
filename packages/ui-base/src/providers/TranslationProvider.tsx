import { createContext, PropsWithChildren } from "react";
import { ITranslation } from "@liberfi/core";

/**
 * Register the translation adapter
 */
export const TranslationContext = createContext<ITranslation>({} as ITranslation);

export function TranslationProvider({
  translation,
  children,
}: PropsWithChildren<{ translation: ITranslation }>) {
  return <TranslationContext.Provider value={translation}>{children}</TranslationContext.Provider>;
}
