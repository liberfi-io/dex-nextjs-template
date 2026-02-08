import { useCallback, useMemo } from "react";
import { Link } from "@heroui/react";
import { ROUTES } from "@liberfi/core";
import { useAuthenticatedCallback, useRouter, useTranslation } from "@liberfi/ui-base";

const headerLinks = [
  {
    label: "extend.header.home",
    href: ROUTES.tokenList.home(),
    isAuthenticated: false,
    active: (pathname: string) => pathname === ROUTES.tokenList.home(),
  },
  {
    label: "extend.header.trade",
    href: ROUTES.trade.home(),
    isAuthenticated: false,
    active: (pathname: string) => pathname.startsWith(ROUTES.trade.home()),
  },
  {
    label: "extend.header.pulse",
    href: ROUTES.pulse.home(),
    isAuthenticated: false,
    active: (pathname: string) => pathname.startsWith(ROUTES.pulse.home()),
  },
  {
    label: "extend.header.predict",
    href: ROUTES.predict.home(),
    isAuthenticated: false,
    active: (pathname: string) => pathname.startsWith(ROUTES.predict.home()),
  },
  // {
  //   label: "extend.header.channels",
  //   href: "/channels",
  //   isAuthenticated: false,
  //   active: (pathname: string) => pathname.startsWith("/channels"),
  // },
  {
    label: "extend.header.account",
    href: ROUTES.account.home(),
    isAuthenticated: true,
    active: (pathname: string) => pathname.startsWith(ROUTES.account.home()),
  },
];

export function HeaderLinks() {
  const { t } = useTranslation();

  const { usePathname, navigate } = useRouter();
  const pathname = usePathname();

  const handleNavigate = useCallback((nav: { href: string }) => navigate(nav.href), [navigate]);

  const handleAuthenticatedNavigate = useAuthenticatedCallback(handleNavigate, [handleNavigate]);

  const links = useMemo(
    () =>
      headerLinks.map((it) => ({
        ...it,
        handler: () => (it.isAuthenticated ? handleAuthenticatedNavigate(it) : handleNavigate(it)),
      })),
    [handleNavigate, handleAuthenticatedNavigate],
  );

  return (
    <div className="flex items-center gap-6 max-lg:hidden">
      {links.map((link) => (
        <Link
          key={link.label}
          data-active={link.active(pathname)}
          className="text-base font-medium data-[active=true]:font-semibold text-neutral data-[active=true]:text-foreground cursor-pointer"
          onPress={link.handler}
          aria-label={t(link.label)}
        >
          {t(link.label)}
        </Link>
      ))}
    </div>
  );
}
