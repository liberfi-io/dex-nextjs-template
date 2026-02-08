import { useContext } from "react";
import { TranslationContext } from "@/providers";

export const useTranslation = () => {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return ctx;
};
