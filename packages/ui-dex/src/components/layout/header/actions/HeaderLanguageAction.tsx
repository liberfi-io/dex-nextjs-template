import { Key, useCallback } from "react";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { TranslateIcon, useTranslation } from "@liberfi/ui-base";

export function HeaderLanguageAction() {
  const { t, i18n } = useTranslation();

  const handleChangeLanguage = useCallback(
    (key: Key) => i18n.changeLanguage(key as string),
    [i18n],
  );

  return (
    <Dropdown placement="bottom-end" size="sm" classNames={{ content: "rounded-lg" }}>
      <DropdownTrigger>
        <Button
          isIconOnly
          className="max-lg:hidden bg-content2 w-7 min-w-0 h-7 min-h-0 rounded"
          disableRipple
          aria-label={t("extend.header.language")}
        >
          <TranslateIcon width={16} height={16} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={t("extend.header.language")}
        selectionMode="single"
        selectedKeys={[i18n.language]}
        onAction={handleChangeLanguage}
        hideSelectedIcon
      >
        {i18n.languages.map((language) => (
          <DropdownItem
            key={language}
            classNames={{
              base: "text-neutral data-[hover=true]:bg-content3 data-[selectable=true]:focus:bg-content3",
            }}
          >
            {t(`extend.languages.${language}`)}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
