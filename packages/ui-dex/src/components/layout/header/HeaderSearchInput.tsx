import { useCallback } from "react";
import { Input } from "@heroui/react";
import { SearchIcon, useAppSdk, useTranslation } from "@liberfi/ui-base";

export function HeaderSearchInput() {
  const { t } = useTranslation();

  const appSdk = useAppSdk();

  const handleSearch = useCallback(() => appSdk.events.emit("search:open"), [appSdk]);

  return (
    <Input
      placeholder={t("extend.header.search_placeholder")}
      fullWidth
      classNames={{
        inputWrapper:
          "h-7 min-h-7 bg-content1 data-[hover=true]:bg-content2 group-data-[focus=true]:bg-content2",
      }}
      startContent={<SearchIcon width={18} height={18} className="text-neutral" />}
      onClick={handleSearch}
    />
  );
}
