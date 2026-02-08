import { Link } from "@heroui/react";
import { CONFIG, ROUTES } from "@liberfi/core";
import { useTranslation } from "@liberfi/ui-base";

export function HeaderBrand() {
  const { t } = useTranslation();

  return (
    <Link href={ROUTES.tokenList.home()} aria-label={t("extend.header.home")}>
      <img src={CONFIG.branding.logo} alt={CONFIG.branding.name} className="h-8" />
    </Link>
  );
}
