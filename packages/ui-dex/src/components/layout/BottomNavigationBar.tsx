import { useCallback, useMemo } from "react";
import { useAtomValue } from "jotai";
import { Button } from "@heroui/react";
import { ROUTES } from "@liberfi/core";
import {
  bottomNavigationBarActiveKeyAtom,
  HomeIcon,
  PulseIcon,
  // SearchIcon,
  CoinsIcon,
  // SignalIcon,
  TrackIcon,
  // useAppSdk,
  useAuthenticatedCallback,
  useRouter,
  useTranslation,
  WalletIcon,
} from "@liberfi/ui-base";

const bottomNavigations = [
  {
    key: "token_list",
    title: "extend.footer.token_list",
    href: ROUTES.tokenList.home(),
    icon: <HomeIcon width={20} height={20} />,
    isAuthenticated: false,
  },
  {
    key: "predict",
    title: "extend.header.predict",
    href: ROUTES.predict.home(),
    icon: <CoinsIcon width={20} height={20} />,
    isAuthenticated: false,
  },
  // {
  //   key: "channels",
  //   title: "extend.header.channels",
  //   href: "/channels",
  //   icon: <SignalIcon width={20} height={20} />,
  //   isAuthenticated: false,
  // },
];
const bottomNavigations2 = [
  {
    key: "track",
    title: "extend.footer.track",
    href: "/media-track",
    icon: <TrackIcon width={20} height={20} />,
    isAuthenticated: false,
  },
  {
    key: "pulse",
    title: "extend.footer.pulse",
    href: ROUTES.pulse.home(),
    icon: <PulseIcon width={20} height={20} />,
    isAuthenticated: false,
  },
  {
    key: "account",
    title: "extend.footer.account",
    href: ROUTES.account.home(),
    icon: <WalletIcon width={20} height={20} />,
    isAuthenticated: true,
  },
];

export function BottomNavigationBar() {
  const { t } = useTranslation();

  // const appSdk = useAppSdk();

  const { navigate } = useRouter();

  const key = useAtomValue(bottomNavigationBarActiveKeyAtom);

  const handleNavigate = useCallback(
    (nav: { href: string; key: string }) => {
      if (nav.key === key) return;
      navigate(nav.href);
    },
    [key, navigate],
  );

  const handleAuthenticatedNavigate = useAuthenticatedCallback(handleNavigate, [handleNavigate]);

  const navigations = useMemo(
    () =>
      bottomNavigations.map((it) => ({
        ...it,
        handler: () => (it.isAuthenticated ? handleAuthenticatedNavigate(it) : handleNavigate(it)),
      })),
    [handleNavigate, handleAuthenticatedNavigate],
  );

  const navigations2 = useMemo(
    () =>
      bottomNavigations2.map((it) => ({
        ...it,
        handler: () => (it.isAuthenticated ? handleAuthenticatedNavigate(it) : handleNavigate(it)),
      })),
    [handleNavigate, handleAuthenticatedNavigate],
  );

  // const handleSearch = useCallback(() => appSdk.events.emit("search:open"), [appSdk]);

  return (
    <div className="w-full h-full pb-2 bg-background border-t border-content3 flex justify-around items-center">
      {navigations.map((it) => (
        <Button
          key={it.key}
          className="h-full flex-col justify-end gap-0.5 bg-transparent text-xs font-medium text-neutral data-[selected=true]:text-foreground px-0 min-w-0 w-1/5"
          startContent={it.icon}
          data-selected={key === it.key}
          disableRipple
          onPress={it.handler}
        >
          {t(it.title)}
        </Button>
      ))}

      {/* <Button
        className="h-full flex-col justify-end gap-0.5 bg-transparent text-xs font-medium text-neutral data-[selected=true]:text-foreground px-0 min-w-0 w-1/5"
        startContent={<SearchIcon width={20} height={20} />}
        disableRipple
        onPress={handleSearch}
      >
        {t("extend.footer.search")}
      </Button> */}

      {navigations2.map((it) => (
        <Button
          key={it.key}
          className="h-full flex-col justify-end gap-0.5 bg-transparent text-xs font-medium text-neutral data-[selected=true]:text-foreground px-0 min-w-0 w-1/5"
          startContent={it.icon}
          data-selected={key === it.key}
          disableRipple
          onPress={it.handler}
        >
          {t(it.title)}
        </Button>
      ))}
    </div>
  );
}
