"use client";

/**
 * AppLayout for the (new) route group.
 *
 * Provider nesting follows the storybook decorator order
 * (apps/storybook/.storybook/preview.tsx):
 *
 *   QueryClientProvider          (withQueryClient)
 *   └─ WalletConnector           (withWalletConnector)
 *       └─ LocaleProvider        (withI18n)
 *           └─ ServiceProviders  (withDex / withMediaTrack / withChannels / withPredict / withPortfolio)
 *               └─ PageShell     (withPage + withToast + withModals)
 */

import { Key, PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Chain } from "@liberfi.io/types";
import { Client } from "@liberfi.io/client";
import { DexClientProvider } from "@liberfi.io/react";
import {
  LocaleCode,
  LocaleProvider,
  useTranslation,
  useLocale,
  useChangeLocale,
  useLocaleContext,
} from "@liberfi.io/i18n";
import { useAuth, useConnectedWallet, useSwitchChain } from "@liberfi.io/wallet-connector";
import { ChainSelectWidget, useCurrentChain } from "@liberfi.io/ui-chain-select";
import { MediaTrackClient } from "@liberfi.io/ui-media-track/client";
import { MediaTrackProvider } from "@liberfi.io/ui-media-track";
import { ChannelsClient } from "@liberfi.io/ui-channels/client";
import { ChannelsProvider } from "@liberfi.io/ui-channels";
import { PredictClient } from "@liberfi.io/ui-predict/client";
import { PredictProvider } from "@liberfi.io/ui-predict";
import { PortfolioClient } from "@liberfi.io/ui-portfolio/client";
import { PortfolioClientProvider, PortfolioProvider } from "@liberfi.io/ui-portfolio";
import { AccountInfoWidget } from "@liberfi.io/ui-portfolio";
import {
  StyledToaster,
  toast,
  CoinsIcon,
  HomeIcon,
  LogoIcon,
  MiniLogoIcon,
  RocketIcon,
  SignalIcon,
  TradeIcon,
  TranslateIcon,
  WalletIcon,
  cn,
} from "@liberfi.io/ui";
import {
  Scaffold,
  ScaffoldHeader,
  ScaffoldFooter,
  Logo,
  type NavItem,
} from "@liberfi.io/ui-scaffold";
import { SearchTokensButton, SearchModal } from "@liberfi.io/ui-tokens";
import { capitalize, chainSlug } from "@liberfi.io/utils";
import {
  useDexTokenProvider,
  TranslationProvider,
  AppSdkProvider,
  queryClientSubject,
  dexClientSubject,
} from "@liberfi/ui-base";
import { useDexClient } from "@liberfi/react-dex";
import { DexDataProvider } from "@liberfi/ui-dex";
import { queryClient } from "../libs/queryClient";
import { AuthProviders } from "./AuthProviders";
import { useTranslationAdapter } from "../hooks/useTranslationAdapter";
import { browserAppSdk } from "../libs/browser/BrowserAppSdk";
import en from "@liberfi/locales/locales/en/translation.json";
import zh from "@liberfi/locales/locales/zh/translation.json";
import en2 from "@liberfi.io/i18n/locales/en.json";
import zh2 from "@liberfi.io/i18n/locales/zh.json";
import { PresetFormModal } from "@liberfi.io/ui-trade";
import { useAsyncModal } from "@liberfi.io/ui-scaffold";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { LaunchPadModal, LAUNCHPAD_MODAL_ID } from "./modals/LaunchPadModal";

const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

const navItemsConfig: Omit<NavItem, "label">[] = [
  { key: "discover", href: "/", icon: <HomeIcon width={20} height={20} /> },
  { key: "perpetuals", href: "/perpetuals", icon: <TradeIcon width={20} height={20} /> },
  { key: "predict", href: "/predict", icon: <CoinsIcon width={20} height={20} /> },
  { key: "channels", href: "/channels", icon: <SignalIcon width={20} height={20} /> },
  { key: "portfolio", href: "/portfolio", icon: <WalletIcon width={20} height={20} /> },
];

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export function NewAppLayout({ children, locale }: PropsWithChildren<{ locale: LocaleCode }>) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProviders>
        <LocaleProvider
          locale={locale}
          supportedLanguages={["en", "zh"]}
          resources={{
            en: { ...en, ...en2 },
            zh: { ...zh, ...zh2 },
          }}
        >
          <ServiceProviders>
            <LegacyBridge>
              <PageShell>{children}</PageShell>
              <LaunchPadModal />
              <StyledToaster />
              <SearchModal />
              <PresetFormModal />
            </LegacyBridge>
          </ServiceProviders>
        </LocaleProvider>
      </AuthProviders>
    </QueryClientProvider>
  );
}

// ---------------------------------------------------------------------------
// Service providers (withDex + withMediaTrack + withChannels + withPredict + withPortfolio)
// ---------------------------------------------------------------------------

function ServiceProviders({ children }: PropsWithChildren) {
  const loader = useMemo(
    () => ({
      async set(token: string, expiresAt: Date) {
        Cookies.set("dex-token", token, {
          expires: expiresAt,
          secure: true,
          sameSite: "strict" as const,
        });
      },
      async get() {
        return Cookies.get("dex-token") ?? null;
      },
    }),
    [],
  );

  const dexTokenProvider = useDexTokenProvider(loader);

  const apiClient = useMemo(
    () =>
      new Client(dexTokenProvider, {
        serverUrl: baseUrl + process.env.NEXT_PUBLIC_DEX_AGGREGATOR_URL,
      }),
    [dexTokenProvider],
  );

  const mediaTrackClient = useMemo(
    () =>
      new MediaTrackClient({
        endpoint: baseUrl + process.env.NEXT_PUBLIC_MEDIA_TRACK_URL,
        streamEndpoint: process.env.NEXT_PUBLIC_MEDIA_TRACK_STREAM_URL,
        accessToken: dexTokenProvider,
      }),
    [dexTokenProvider],
  );

  const { user } = useAuth();

  const channelsTokenProvider = useMemo(
    () => ({ getToken: async () => Promise.resolve(user?.accessToken) }),
    [user],
  );

  const channelsClient = useMemo(
    () =>
      new ChannelsClient({
        endpoint: baseUrl + process.env.NEXT_PUBLIC_CHANNELS_URL,
        accessToken: channelsTokenProvider,
      }),
    [channelsTokenProvider],
  );

  const predictClient = useMemo(
    () => new PredictClient(baseUrl + process.env.NEXT_PUBLIC_PREDICT_URL),
    [],
  );

  const portfolioClient = useMemo(
    () => new PortfolioClient(baseUrl + process.env.NEXT_PUBLIC_DEX_AGGREGATOR_URL),
    [],
  );

  const { chain } = useCurrentChain();
  const wallet = useConnectedWallet(chain);

  return (
    <DexClientProvider client={apiClient} subscribeClient={apiClient}>
      <MediaTrackProvider client={mediaTrackClient}>
        <ChannelsProvider client={channelsClient}>
          <PredictProvider client={predictClient}>
            <PortfolioClientProvider client={portfolioClient}>
              <PortfolioProvider chain={chain} address={wallet?.address ?? ""}>
                {children}
              </PortfolioProvider>
            </PortfolioClientProvider>
          </PredictProvider>
        </ChannelsProvider>
      </MediaTrackProvider>
    </DexClientProvider>
  );
}

// ---------------------------------------------------------------------------
// Legacy bridge (provides TranslationProvider + AppSdkProvider + DexDataProvider
// so that @liberfi/ui-dex components work inside the new layout)
// ---------------------------------------------------------------------------

function LegacyBridge({ children }: PropsWithChildren) {
  const translation = useTranslationAdapter();

  const qc = useQueryClient();
  useEffect(() => {
    queryClientSubject.next(qc);
  }, [qc]);

  const dc = useDexClient();
  useEffect(() => {
    dexClientSubject.next(dc);
  }, [dc]);

  // Delay children mount until subjects are synced (mirrors UIKitProvider's ready gate)
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setTimeout(() => setReady(true));
  }, []);

  return (
    <TranslationProvider translation={translation}>
      <AppSdkProvider appSdk={browserAppSdk}>
        {ready ? <DexDataProvider>{children}</DexDataProvider> : null}
      </AppSdkProvider>
    </TranslationProvider>
  );
}

// ---------------------------------------------------------------------------
// Page shell (withPage — Scaffold with header / footer)
// ---------------------------------------------------------------------------

function PageShell({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = useMemo(
    () =>
      navItemsConfig.map((item) => ({
        ...item,
        label: t(`extend.nav.${item.key}`) as string,
      })),
    [t],
  );

  const onNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  const { chain } = useCurrentChain();
  const switchChain = useSwitchChain();

  return (
    <Scaffold
      pathname={pathname}
      onNavigate={onNavigate}
      headerVisible={["desktop", "tablet", "mobile"]}
      footerVisible={["mobile"]}
      header={
        <ScaffoldHeader
          left={<Logo icon={<LogoIcon />} miniIcon={<MiniLogoIcon />} />}
          navItems={navItems}
          right={
            <>
              <SearchTokensButton
                chains={[chain]}
                onSelectToken={(token) => {
                  const slug = chainSlug(token.chain);
                  if (slug) {
                    router.push(`/tokens/${slug}/${token.address}`);
                  }
                }}
              />

              <ChainSelectWidget
                size="sm"
                className="max-sm:hidden"
                onSwitchChain={switchChain}
                candidates={[Chain.SOLANA, Chain.ETHEREUM, Chain.BINANCE]}
                onSuccess={(c) =>
                  toast.success(
                    t("common.chainSwitched", {
                      chain: capitalize(chainSlug(c) ?? "") ?? "",
                    }),
                  )
                }
                onError={(e) =>
                  toast.error(e instanceof Error ? e.message : t("common.chainSwitchFailed"))
                }
              />

              <LaunchPadButton />

              <LanguageButton />

              <AccountInfoWidget />
            </>
          }
        />
      }
      footer={<ScaffoldFooter navItems={navItems} />}
    >
      {children}
    </Scaffold>
  );
}

// ---------------------------------------------------------------------------
// Header action buttons
// ---------------------------------------------------------------------------

function LaunchPadButton() {
  const { t } = useTranslation();
  const { onOpen } = useAsyncModal(LAUNCHPAD_MODAL_ID);

  const handleLaunchpad = useCallback(() => {
    onOpen();
  }, [onOpen]);

  return (
    <Button
      isIconOnly
      className="bg-content2 w-8 min-w-0 h-8 min-h-0 rounded-full text-bullish"
      onPress={handleLaunchpad}
      disableRipple
      aria-label={t("extend.header.launchpad")}
    >
      <RocketIcon width={16} height={16} />
    </Button>
  );
}

function LanguageButton() {
  const { t } = useTranslation();
  const locale = useLocale();
  const changeLocale = useChangeLocale();
  const { languages } = useLocaleContext();

  const handleChangeLanguage = useCallback(
    (key: Key) => changeLocale(key as LocaleCode),
    [changeLocale],
  );

  return (
    <Dropdown placement="bottom-end" size="sm" classNames={{ content: "rounded-lg" }}>
      <DropdownTrigger>
        <Button
          isIconOnly
          className="bg-content2 w-8 min-w-0 h-8 min-h-0 rounded-full"
          disableRipple
          aria-label={t("extend.header.language")}
        >
          <TranslateIcon width={16} height={16} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={t("extend.header.language")}
        selectionMode="single"
        selectedKeys={[locale]}
        onAction={handleChangeLanguage}
        classNames={{ list: "gap-1" }}
        itemClasses={{
          base: cn("rounded-md px-3 h-8"),
        }}
      >
        {languages.map((lang) => (
          <DropdownItem
            key={lang.localCode}
            className={cn(
              lang.localCode === locale ? "bg-content2 text-foreground" : "text-neutral",
              "data-[hover=true]:bg-content2 data-[hover=true]:text-foreground",
              "data-[selectable=true]:focus:bg-content2 data-[selectable=true]:focus:text-foreground",
            )}
          >
            {lang.displayName}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
