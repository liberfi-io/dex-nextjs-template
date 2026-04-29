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

import {
  PropsWithChildren,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ChainStreamClient } from "@chainstream-io/sdk";
import { Chain } from "@liberfi.io/types";
import { Client } from "@liberfi.io/client";
import { DexClientProvider as APIClientProvider } from "@liberfi.io/react";
import { DexClientProvider } from "@liberfi/react-dex";
import {
  LocaleCode,
  LocaleProvider,
  useTranslation,
  useLocale,
  useChangeLocale,
  useLocaleContext,
} from "@liberfi.io/i18n";
import {
  useAuth,
  useConnectedWallet,
  useSwitchChain,
  useWallets,
  type EvmWalletAdapter,
} from "@liberfi.io/wallet-connector";
import { useCurrentChain, useSelectChain } from "@liberfi.io/ui-chain-select";
import { MediaTrackClient } from "@liberfi.io/ui-media-track/client";
import { MediaTrackProvider } from "@liberfi.io/ui-media-track";
import { ChannelsClient } from "@liberfi.io/ui-channels/client";
import { ChannelsProvider } from "@liberfi.io/ui-channels";
import {
  PerpetualsProvider,
  HyperliquidPerpetualsClient,
  LiberFiPerpDepositClient,
} from "@liberfi.io/ui-perpetuals";
import { PredictClient, PredictProvider, PolymarketProvider } from "@liberfi.io/react-predict";
import type { PredictEvent } from "@liberfi.io/react-predict";
import {
  SearchEventsButton,
  PredictSearchModal,
  PREDICT_SEARCH_MODAL_ID,
  PredictWalletProvider,
} from "@liberfi.io/ui-predict";
import { predictEventHref } from "./page/predict-source";
import { PortfolioClient } from "@liberfi.io/ui-portfolio/client";

const NoPrefetchLink: LinkComponentType = (props) => <Link prefetch={false} {...props} />;
import { PortfolioClientProvider, PortfolioProvider } from "@liberfi.io/ui-portfolio";
import {
  StyledToaster,
  toast,
  BinanceIcon,
  CoinsIcon,
  EthereumIcon,
  HomeIcon,
  LogoIcon,
  MiniLogoIcon,
  RocketIcon,
  SearchIcon,
  SignInIcon,
  SolanaIcon,
  // SignalIcon,
  TradeIcon,
  TranslateIcon,
  TokenIcon,
  WalletIcon,
  cn,
  useScreen,
} from "@liberfi.io/ui";
import type { LinkComponentType } from "@liberfi.io/ui";
import {
  Scaffold,
  ScaffoldHeader,
  ScaffoldFooter,
  Logo,
  type NavItem,
  DraggablePanelProvider,
} from "@liberfi.io/ui-scaffold";
import {
  SearchTokensButton,
  SearchModal,
  SEARCH_MODAL_ID,
  type SearchModalParams,
  type SearchModalResult,
} from "@liberfi.io/ui-tokens";
import { capitalize, chainDisplayName, chainSlug, truncateAddress } from "@liberfi.io/utils";
import type { PredefinedToken } from "@liberfi.io/utils";
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
import { useAccountInfo } from "@liberfi.io/ui-portfolio";
import { LaunchPadModal, LAUNCHPAD_MODAL_ID } from "./modals/LaunchPadModal";
import {
  DepositHyperliquidUsdcModal,
  DEPOSIT_HL_USDC_MODAL_ID,
} from "./modals/DepositHyperliquidUsdcModal";
import { useHyperliquidBalances } from "../hooks/useHyperliquidBalances";
import { HyperliquidUsdcIcon } from "./icons/HyperliquidUsdcIcon";
import { AppBottomToolbar } from "./AppBottomToolbar";
import { BottomTweets } from "./BottomTweets";
import { BottomAICopilot } from "./BottomAICopilot";
import { PredictDepositButton } from "./PredictDepositButton";
import { PredictAccountButton } from "./PredictAccountButton";
import { PredictBalanceIndicator } from "./PredictBalanceIndicator";
import { FundWalletModal } from "./FundWalletModal";

const LegacyModals = [
  lazy(() => import("@liberfi/ui-dex/components/modals/WebviewModal")),
  lazy(() => import("@liberfi/ui-dex/components/modals/ReceiveModal")),
  lazy(() => import("@liberfi/ui-dex/components/modals/AssetSelectModal")),
  lazy(() => import("@liberfi/ui-dex/components/modals/TokenSelectModal")),
  lazy(() => import("@liberfi/ui-dex/components/modals/SwapModal")),
  lazy(() => import("@liberfi/ui-dex/components/modals/TransferModal")),
];

const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

const navItemsConfig: Omit<NavItem, "label">[] = [
  { key: "discover", href: "/", icon: <HomeIcon width={20} height={20} /> },
  { key: "perpetuals", href: "/perpetuals", icon: <TradeIcon width={20} height={20} /> },
  { key: "predict", href: "/predict", icon: <CoinsIcon width={20} height={20} /> },
  // { key: "channels", href: "/channels", icon: <SignalIcon width={20} height={20} /> },
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
              <DepositHyperliquidUsdcModal />
              <StyledToaster />
              <SearchModal />
              <PredictSearchModal />
              <PresetFormModal />
              <Suspense>
                {LegacyModals.map((Modal, i) => (
                  <Modal key={i} />
                ))}
              </Suspense>
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

  const dexClient = useMemo(
    () =>
      new ChainStreamClient(dexTokenProvider, {
        serverUrl: baseUrl + process.env.NEXT_PUBLIC_DEX_AGGREGATOR_URL,
      }),
    [dexTokenProvider],
  );

  const apiClient = useMemo(
    () =>
      new Client(dexTokenProvider, {
        serverUrl: baseUrl + process.env.NEXT_PUBLIC_DEX_AGGREGATOR_URL,
        nativeBalanceApiUrl: "/api/balance",
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
    () => ({
      getToken: async () => Promise.resolve(user?.accessToken ?? null),
    }),
    [user],
  );

  const channelsClient = useMemo(
    () =>
      new ChannelsClient({
        endpoint: baseUrl + process.env.NEXT_PUBLIC_CHANNELS_URL,
        accessToken: channelsTokenProvider ?? { getToken: async () => Promise.resolve(null) },
      }),
    [channelsTokenProvider],
  );

  const predictClient = useMemo(
    () => new PredictClient(baseUrl + process.env.NEXT_PUBLIC_PREDICT_URL),
    [],
  );

  // TODO: re-enable when prediction WS backend is ready
  const predictWsClient = null;
  // const predictWsClient = useMemo(() => {
  //   const wsUrl = process.env.NEXT_PUBLIC_PREDICT_WS_URL;
  //   if (!wsUrl) return null;
  //   return createPredictWsClient({ wsUrl, autoConnect: false, autoReconnect: true });
  // }, []);

  const portfolioClient = useMemo(
    () => new PortfolioClient(baseUrl + process.env.NEXT_PUBLIC_DEX_AGGREGATOR_URL),
    [],
  );

  const perpetualsClient = useMemo(
    () => new HyperliquidPerpetualsClient({ environment: "mainnet" }),
    [],
  );

  // Solana → Hyperliquid deposit client (perpetuals-server REST API).
  // Only constructed when a backend URL is configured. The widget shows
  // an inline "not configured" hint when this is undefined.
  const perpDepositClient = useMemo(() => {
    const apiPath = process.env.NEXT_PUBLIC_PERPETUALS_API_PATH;
    if (!apiPath) return undefined;
    return new LiberFiPerpDepositClient({ baseUrl: baseUrl + apiPath });
  }, []);

  const { chain } = useCurrentChain();
  const wallet = useConnectedWallet(chain);

  return (
    <DexClientProvider client={dexClient}>
      <APIClientProvider client={apiClient} subscribeClient={apiClient}>
        <MediaTrackProvider client={mediaTrackClient}>
          <ChannelsProvider client={channelsClient}>
            <PredictProvider client={predictClient} wsClient={predictWsClient}>
              <PolymarketProvider>
              <PortfolioClientProvider client={portfolioClient}>
                <PortfolioProvider chain={chain} address={wallet?.address ?? ""}>
                  <PerpetualsProvider
                    client={perpetualsClient}
                    depositClient={perpDepositClient}
                  >
                    {children}
                  </PerpetualsProvider>
                </PortfolioProvider>
              </PortfolioClientProvider>
              </PolymarketProvider>
            </PredictProvider>
          </ChannelsProvider>
        </MediaTrackProvider>
      </APIClientProvider>
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
  const { status: authStatus } = useAuth();

  const isPredictPage = pathname.startsWith("/predict");
  const isAuthenticated = authStatus === "authenticated";

  const { onOpen: openSearchModal } = useAsyncModal<
    SearchModalParams,
    SearchModalResult
  >(SEARCH_MODAL_ID);

  const { onOpen: openPredictSearch, onClose: closePredictSearch } =
    useAsyncModal(PREDICT_SEARCH_MODAL_ID);

  const handlePredictHover = useCallback(
    (event: PredictEvent) => {
      router.prefetch(predictEventHref(event));
    },
    [router],
  );

  const searchModalParams = useMemo(
    () => ({
      getEventHref: (event: PredictEvent) => predictEventHref(event),
      LinkComponent: NoPrefetchLink,
      onHover: handlePredictHover,
    }),
    [handlePredictHover],
  );

  const handleOpenSearch = useCallback(async () => {
    if (isPredictPage) {
      openPredictSearch({ params: searchModalParams });
    } else {
      const result = await openSearchModal({ params: { chains: [chain] } });
      if (result) {
        const slug = chainSlug(result.chain);
        if (slug) {
          router.push(`/tokens/${slug}/${result.address}`);
        }
      }
    }
  }, [isPredictPage, openPredictSearch, searchModalParams, openSearchModal, chain, router]);

  const handleSelectPredictEvent = useCallback(
    (event: PredictEvent) => {
      router.push(predictEventHref(event));
      closePredictSearch();
    },
    [router, closePredictSearch],
  );

  return (
    <PredictWalletProvider enabled={isPredictPage}>
      {/* FundWalletModal must live INSIDE PredictWalletProvider because it
          calls usePredictWallet() during render. Rendering it as a sibling of
          PageShell (outside the provider) would crash with "usePredictWallet
          must be used within a PredictWalletProvider" the moment the user
          opens the deposit dialog. */}
      <FundWalletModal />
      <Scaffold
        pathname={pathname}
        onNavigate={onNavigate}
        headerVisible={["desktop", "tablet", "mobile"]}
        footerVisible={["mobile"]}
        toolbar={<AppBottomToolbar />}
        toolbarVisible={["desktop"]}
        header={
          <ScaffoldHeader className="!bg-[#0a0a0b] !border-none">
            <div
              className="w-full h-full px-6 max-lg:px-4 max-sm:px-3 flex items-center gap-6 max-lg:gap-4 max-sm:gap-2"
              style={{ borderBottom: "1px solid rgba(39,39,42,0.6)" }}
            >
              {/* Left: Logo + desktop nav tabs */}
              <div className="shrink-0 flex items-center gap-1">
                <Logo icon={<LogoIcon />} miniIcon={<MiniLogoIcon />} />
                <div className="hidden sm:flex items-center gap-1 ml-2">
                  {navItems.map((item) => {
                    const active =
                      item.href === "/"
                        ? !navItemsConfig.some(
                            (other) =>
                              other.href !== "/" &&
                              pathname.startsWith(other.href),
                          )
                        : pathname.startsWith(item.href);
                    return (
                      <NavTab
                        key={item.key}
                        item={item}
                        active={active}
                        onNavigate={onNavigate}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Center: Search bar — desktop only */}
              <div className="hidden lg:flex flex-1 min-w-0 justify-center">
                {isPredictPage ? (
                  <SearchEventsButton
                    displayMode="desktop"
                    onSelectEvent={handleSelectPredictEvent}
                    modalParams={searchModalParams}
                    className="!w-56 !min-w-0 !rounded-full !bg-zinc-900/60 !border-[1px] !border-zinc-800 hover:!border-zinc-700 !h-[32px] !min-h-0 !transition-none [&_kbd]:!rounded-full [&_kbd]:!bg-zinc-800/60 [&_kbd]:!border-zinc-700/50 [&_kbd]:!text-zinc-500 [&_kbd]:!font-mono [&_kbd]:!text-[10px]"
                  />
                ) : (
                  <SearchTokensButton
                    chains={[chain]}
                    onSelectToken={(token) => {
                      const slug = chainSlug(token.chain);
                      if (slug) {
                        router.push(`/tokens/${slug}/${token.address}`);
                      }
                    }}
                    className="!w-56 !min-w-0 !rounded-full !bg-zinc-900/60 !border-[1px] !border-zinc-800 hover:!border-zinc-700 !h-[32px] !min-h-0 !transition-none [&_kbd]:!rounded-full [&_kbd]:!bg-zinc-800/60 [&_kbd]:!border-zinc-700/50 [&_kbd]:!text-zinc-500 [&_kbd]:!font-mono [&_kbd]:!text-[10px]"
                  />
                )}
              </div>

              {/* Right: search icon (tablet/mobile) + chain select + launchpad + language + account */}
              <div className="shrink-0 ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenSearch}
                  aria-label="Search"
                  className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors border bg-zinc-800/60 text-zinc-300 border-zinc-700/50 hover:bg-zinc-800 hover:text-white cursor-pointer focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  <SearchIcon width={14} height={14} />
                </button>

                {!isPredictPage && (
                  <ChainSelectDropdown
                    className="max-sm:hidden"
                    candidates={[Chain.SOLANA, Chain.ETHEREUM, Chain.BINANCE]}
                    onSwitchChain={switchChain}
                    onSuccess={(c) =>
                      toast.success(
                        t("common.chainSwitched", {
                          chain: capitalize(chainSlug(c) ?? "") ?? "",
                        }),
                      )
                    }
                    onError={(e) =>
                      toast.error(
                        e instanceof Error
                          ? e.message
                          : t("common.chainSwitchFailed"),
                      )
                    }
                  />
                )}

                {!isPredictPage && <LaunchPadButton />}

                {isPredictPage && isAuthenticated && <PredictBalanceIndicator />}
                {isPredictPage && isAuthenticated && <PredictDepositButton />}

                <div className="hidden sm:block">
                  <LanguageButton />
                </div>

                {isPredictPage ? (
                  <PredictAccountButton />
                ) : (
                  <DexAccountButton />
                )}
              </div>
            </div>
          </ScaffoldHeader>
        }
        footer={<ScaffoldFooter navItems={navItems} />}
      >
        <DraggablePanelProvider
          contents={[
            {
              id: "mediaTrack",
              title: t("extend.toolbar.media_track_tooltip"),
              children: <BottomTweets />,
              modalMaxWidth: 440,
              modalMinWidth: 320,
              panelMinWidth: 320,
              panelMaxWidth: 440,
            },
            {
              id: "aiCopilot",
              title: t("extend.toolbar.ai_copilot"),
              children: <BottomAICopilot />,
              modalMaxWidth: 440,
              modalMinWidth: 320,
              panelMinWidth: 320,
              panelMaxWidth: 440,
            },
          ]}
        >
          {children}
        </DraggablePanelProvider>
      </Scaffold>
    </PredictWalletProvider>
  );
}

// ---------------------------------------------------------------------------
// NavTab — uses Next.js Link for automatic prefetch
// ---------------------------------------------------------------------------

function NavTab({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: (href: string) => void;
}) {
  return (
    <Link
      href={item.href}
      prefetch
      data-active={active}
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-[10px] transition-colors cursor-pointer whitespace-nowrap focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        active
          ? "text-[#c7ff2e]"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40",
      )}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
    >
      {item.label}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Header action buttons — all 32px tall, rounded-full
// ---------------------------------------------------------------------------

const TRIGGER_CLASS =
  "flex items-center justify-center h-8 rounded-full text-sm font-medium transition-colors border bg-zinc-800/60 border-zinc-700/50 hover:bg-zinc-800 cursor-pointer focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

const DROPDOWN_STYLE: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid rgba(39,39,42,1)",
  background: "rgba(24,24,27,1)",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
};

function LaunchPadButton() {
  const { t } = useTranslation();
  const { onOpen } = useAsyncModal(LAUNCHPAD_MODAL_ID);

  return (
    <button
      type="button"
      onClick={() => onOpen()}
      aria-label={t("extend.header.launchpad")}
      className={cn(TRIGGER_CLASS, "w-8 text-bullish")}
    >
      <RocketIcon width={14} height={14} />
    </button>
  );
}

function LanguageButton() {
  const { t } = useTranslation();
  const locale = useLocale();
  const changeLocale = useChangeLocale();
  const { languages } = useLocaleContext();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const handleSelect = useCallback(
    (code: LocaleCode) => {
      changeLocale(code);
      setIsOpen(false);
    },
    [changeLocale],
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("extend.header.language")}
        className={cn(TRIGGER_CLASS, "w-8 text-zinc-300 hover:text-white")}
      >
        <TranslateIcon width={14} height={14} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-36 z-50 overflow-hidden"
          style={DROPDOWN_STYLE}
        >
          <div className="p-1">
            {languages.map((lang) => {
              const selected = lang.localCode === locale;
              return (
                <button
                  key={lang.localCode}
                  type="button"
                  onClick={() =>
                    handleSelect(lang.localCode as LocaleCode)
                  }
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-sm transition-all cursor-pointer",
                    selected
                      ? "bg-[#c7ff2e]/[0.08] text-[#c7ff2e]"
                      : "text-zinc-400 hover:text-white hover:bg-[rgba(39,39,42,0.5)]",
                  )}
                >
                  {lang.displayName}
                  {selected && (
                    <svg
                      viewBox="0 0 24 24"
                      width={16}
                      height={16}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChainSelectDropdown — prediction-style custom dropdown for chain switching
// Uses useSelectChain to update both wallet chain and Jotai atoms.
// ---------------------------------------------------------------------------

function ChainSelectDropdown({
  className,
  candidates,
  onSwitchChain,
  onSuccess,
  onError,
}: {
  className?: string;
  candidates: Chain[];
  onSwitchChain?: (chain: Chain) => Promise<void>;
  onSuccess?: (chain: Chain) => void;
  onError?: (error: unknown) => void;
}) {
  const { chain } = useCurrentChain();
  const { selectChain, isSwitching } = useSelectChain({
    onSwitchChain,
    onSuccess,
    onError,
  });
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const handleSelect = useCallback(
    async (c: Chain) => {
      if (c === chain) {
        setIsOpen(false);
        return;
      }
      await selectChain(c);
      setIsOpen(false);
    },
    [chain, selectChain],
  );

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className={cn(
          TRIGGER_CLASS,
          "gap-1.5 px-2.5 text-zinc-300 hover:text-white",
        )}
      >
        <ChainIcon chain={chain} size={16} />
        <span className="text-xs font-medium">
          {chainDisplayName(chain)}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "text-zinc-500 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-44 z-50 overflow-hidden"
          style={DROPDOWN_STYLE}
        >
          <div className="p-1">
            {candidates.map((c) => {
              const selected = c === chain;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-sm transition-all cursor-pointer",
                    selected
                      ? "bg-[#c7ff2e]/[0.08] text-[#c7ff2e]"
                      : "text-zinc-400 hover:text-white hover:bg-[rgba(39,39,42,0.5)]",
                  )}
                >
                  <ChainIcon chain={c} size={18} />
                  <span className="flex-1 text-left">
                    {chainDisplayName(c)}
                  </span>
                  {selected && (
                    <svg
                      viewBox="0 0 24 24"
                      width={16}
                      height={16}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="flex-shrink-0"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ChainIcon({ chain, size }: { chain: Chain; size: number }) {
  if (chain === Chain.SOLANA) return <SolanaIcon width={size} height={size} />;
  if (chain === Chain.ETHEREUM) return <EthereumIcon width={size} height={size} />;
  if (chain === Chain.BINANCE) return <BinanceIcon width={size} height={size} />;
  return <div style={{ width: size, height: size }} className="rounded-full bg-zinc-700" />;
}

// ---------------------------------------------------------------------------
// DexAccountButton — wallet balance trigger + popover (prediction style)
// ---------------------------------------------------------------------------

function GradientAvatar({
  seed,
  size = 32,
  className,
}: {
  seed?: string;
  size?: number;
  className?: string;
}) {
  const hash = seed
    ? seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : 0;
  const c1 = `hsl(${(hash * 37) % 360}, 70%, 60%)`;
  const c2 = `hsl(${(hash * 73) % 360}, 65%, 45%)`;
  const c3 = `hsl(${(hash * 113) % 360}, 75%, 55%)`;

  return (
    <div
      className={cn("rounded-lg shadow-inner flex-shrink-0", className)}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`,
      }}
    />
  );
}

function DexAccountButton() {
  const { t } = useTranslation();
  const { isMobile } = useScreen();
  const {
    status,
    signIn,
    signOut,
    balanceUsdFormatted,
    balanceNativeFormatted,
    nativeToken,
    chainNamespace,
    walletAddress,
  } = useAccountInfo();

  const wallets = useWallets();
  const evmWalletForTrigger = useMemo(
    () =>
      wallets.find((w) => w.chainNamespace === "EVM") as
        | EvmWalletAdapter
        | undefined,
    [wallets],
  );
  const hlBalancesTrigger = useHyperliquidBalances(
    evmWalletForTrigger?.address,
  );

  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsOpen(true);
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;
    closeTimer.current = setTimeout(() => setIsOpen(false), 150);
  }, [isMobile]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsOpen(false);
    await signOut();
  }, [signOut]);

  if (status === "unauthenticated") {
    return (
      <button
        type="button"
        onClick={() => signIn()}
        className="flex items-center gap-1.5 h-8 px-3 bg-[#c7ff2e]/10 hover:bg-[#c7ff2e]/20 border border-[#c7ff2e]/25 hover:border-[#c7ff2e]/40 text-[#c7ff2e] rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <SignInIcon width={14} height={14} />
        {t("common.signIn")}
      </button>
    );
  }

  if (status === "authenticating" || status === "deauthenticating") {
    return (
      <div className="flex items-center justify-center w-8 h-8">
        <span className="inline-block w-4 h-4 border-[2px] border-zinc-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(TRIGGER_CLASS, "gap-1.5 px-2.5 text-zinc-300")}
      >
        {nativeToken && (
          <TokenIcon symbol={nativeToken.symbol} size={16} />
        )}
        <span className="text-xs font-medium text-zinc-100 tabular-nums">
          {balanceNativeFormatted}
          {!isMobile && nativeToken && (
            <span className="text-zinc-500 ml-1">{nativeToken.symbol}</span>
          )}
        </span>
        {evmWalletForTrigger && (
          <>
            <span
              className="h-3 w-px bg-zinc-700/80 mx-0.5"
              aria-hidden="true"
            />
            <HyperliquidUsdcIcon size={16} />
            <span className="text-xs font-medium text-zinc-100 tabular-nums">
              {formatHlUsdc(hlBalancesTrigger.perpUsdc)}
              {!isMobile && (
                <span className="text-zinc-500 ml-1">USDC</span>
              )}
            </span>
          </>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "text-zinc-500 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Mobile: bottom sheet */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-full max-w-sm mb-safe animate-in slide-in-from-bottom duration-200"
            style={{
              borderRadius: "14px 14px 0 0",
              border: "1px solid rgba(39,39,42,1)",
              borderBottom: "none",
              background: "rgba(24,24,27,1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full bg-zinc-700" />
            </div>
            <DexAccountMenuContent
              walletAddress={walletAddress}
              chainNamespace={chainNamespace}
              balanceUsdFormatted={balanceUsdFormatted}
              balanceNativeFormatted={balanceNativeFormatted}
              nativeToken={nativeToken}
              copied={copied}
              onCopy={handleCopy}
              onSignOut={handleSignOut}
            />
            <div className="pb-safe" />
          </div>
        </div>
      )}

      {/* Tablet & Desktop: popover */}
      {!isMobile && isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 z-50 overflow-hidden"
          style={DROPDOWN_STYLE}
        >
          <DexAccountMenuContent
            walletAddress={walletAddress}
            chainNamespace={chainNamespace}
            balanceUsdFormatted={balanceUsdFormatted}
            balanceNativeFormatted={balanceNativeFormatted}
            nativeToken={nativeToken}
            copied={copied}
            onCopy={handleCopy}
            onSignOut={handleSignOut}
          />
        </div>
      )}
    </div>
  );
}

function DexAccountMenuContent({
  walletAddress,
  chainNamespace,
  balanceUsdFormatted,
  balanceNativeFormatted,
  nativeToken,
  copied,
  onCopy,
  onSignOut,
}: {
  walletAddress: string;
  chainNamespace: string;
  balanceUsdFormatted: string;
  balanceNativeFormatted: string;
  nativeToken: PredefinedToken | undefined;
  copied: boolean;
  onCopy: () => void;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  const wallets = useWallets();
  const evmWallet = useMemo(
    () =>
      wallets.find((w) => w.chainNamespace === "EVM") as
        | EvmWalletAdapter
        | undefined,
    [wallets],
  );
  const hlBalances = useHyperliquidBalances(evmWallet?.address);
  const { onOpen: openHlUsdcDeposit } = useAsyncModal(
    DEPOSIT_HL_USDC_MODAL_ID,
  );

  return (
    <>
      {/* Wallet address + copy */}
      <div className="p-2">
        <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-[rgba(39,39,42,0.5)] transition-all">
          <GradientAvatar seed={walletAddress} size={28} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-300 truncate">
                {walletAddress ? truncateAddress(walletAddress) : "—"}
              </span>
              {walletAddress && (
                <button
                  type="button"
                  className="p-1 rounded hover:bg-zinc-700 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  title="Copy Address"
                  onClick={onCopy}
                >
                  {copied ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs mt-0.5">
              <span className="text-zinc-500">
                {chainNamespace.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div style={{ borderTop: "1px solid rgba(39,39,42,1)" }} className="p-2">
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-[10px]">
          <div className="flex items-center gap-2.5">
            {nativeToken && <TokenIcon symbol={nativeToken.symbol} size={20} />}
            <span className="text-sm text-zinc-400">
              {nativeToken?.symbol ?? "—"}
            </span>
          </div>
          <span className="text-sm font-medium text-zinc-100 tabular-nums">
            {balanceNativeFormatted}
          </span>
        </div>
        <div className="border-t border-zinc-800/60 my-1" />
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-[10px]">
          <div className="flex items-center gap-2.5">
            <HyperliquidUsdcIcon size={20} />
            <span className="text-sm text-zinc-400">
              {t("extend.hlDeposit.usdcLabel")}
            </span>
          </div>
          <span className="text-sm font-medium text-zinc-100 tabular-nums">
            {evmWallet
              ? formatHlUsdc(hlBalances.perpUsdc)
              : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <span className="text-sm text-zinc-300 font-medium">
            {t("common.totalValue")}
          </span>
          <span className="text-sm font-bold text-[#c7ff2e] tabular-nums">
            {balanceUsdFormatted}
          </span>
        </div>
      </div>

      {/* Deposit Hyperliquid USDC entry */}
      <div style={{ borderTop: "1px solid rgba(39,39,42,1)" }} className="p-2">
        <button
          type="button"
          onClick={() => openHlUsdcDeposit()}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-[10px] transition-colors cursor-pointer text-zinc-200 hover:bg-[rgba(39,39,42,0.5)]"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-[10px] bg-[#97FCE4]/10">
            <HyperliquidUsdcIcon size={18} />
          </div>
          <span>{t("extend.hlDeposit.entry")}</span>
        </button>
      </div>

      {/* Sign out */}
      <div style={{ borderTop: "1px solid rgba(39,39,42,1)" }} className="p-2">
        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-[10px] transition-colors cursor-pointer text-red-400 hover:bg-red-500/10"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-[10px] bg-red-500/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
          {t("common.signOut")}
        </button>
      </div>
    </>
  );
}

function formatHlUsdc(s: string): string {
  const n = Number(s);
  if (!Number.isFinite(n)) return "0";
  if (n === 0) return "0";
  if (n < 0.01) return n.toFixed(6);
  return n.toFixed(2);
}

