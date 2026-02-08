import { SelectedIndicatorIcon, UnselectedIndicatorIcon } from "@/assets";
import { useTranslation } from "@liberfi/ui-base";
import clsx from "clsx";
import { useCallback } from "react";

export type LanguageSettingsProps = {
  className?: string;
  onLanguageChange?: (language: string) => void;
};

export function LanguageSettings({ className, onLanguageChange }: LanguageSettingsProps) {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = useCallback(
    (language: string) => {
      i18n.changeLanguage(language);
      onLanguageChange?.(language);
    },
    [i18n, onLanguageChange],
  );

  return (
    <div className={clsx("w-full flex flex-col gap-2.5", className)}>
      {i18n.languages.map((language) => (
        <div
          key={language}
          data-selected={i18n.language === language}
          className={
            "w-full h-10 px-4 flex items-center gap-2 rounded-lg hover:opacity-hover cursor-pointer " +
            "text-xs text-neutral data-[selected=true]:text-foreground data-[selected=true]:font-medium " +
            "bg-transparent data-[selected=true]:bg-primary/20 " +
            "border border-content3 data-[selected=true]:border-transparent"
          }
          onClick={() => {
            handleLanguageChange(language);
          }}
          aria-label={t("extend.languages." + language)}
        >
          <span className="flex-1 text-left">{t("extend.languages." + language)}</span>
          {i18n.language === language && (
            <SelectedIndicatorIcon width={18} height={18} className="text-primary" />
          )}
          {i18n.language !== language && (
            <UnselectedIndicatorIcon width={18} height={18} className="text-neutral" />
          )}
        </div>
      ))}
    </div>
  );
}
