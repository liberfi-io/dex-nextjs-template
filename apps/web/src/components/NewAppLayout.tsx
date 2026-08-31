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
 *           └─ AppRuntimeProviders (shared client ownership and service providers)
 *               └─ PageShell     (withPage + withToast + withModals)
 */

import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { QueryClientProvider } from "@tanstack/react-query";
import { Chain, Token } from "@liberfi.io/types";
import {
  LocaleCode,
  LocaleProvider,
  useTranslation,
  useLocale,
  useChangeLocale,
  useLocaleContext,
  type LocaleProviderProps,
} from "@liberfi.io/i18n";
import {
  useAuth,
  useSwitchEvmWalletsToChain,
  useWallets,
  type EvmWalletAdapter,
} from "@liberfi.io/wallet-connector";
import { useCurrentChain, useSelectChain } from "@liberfi.io/ui-chain-select";
import type { PredictEvent } from "@liberfi.io/react-predict";
import {
  PredictSearchModal,
  PREDICT_SEARCH_MODAL_ID,
  PredictWalletProvider,
} from "@liberfi.io/ui-predict";
import { predictEventHref } from "./page/predict-source";

const NoPrefetchLink: LinkComponentType = (props) => <ChainAwareLink prefetch={false} {...props} />;
import {
  StyledToaster,
  toast,
  BinanceIcon,
  CoinsIcon,
  EthereumIcon,
  HomeIcon,
  LogoIcon,
  MiniLogoIcon,
  PulseIcon,
  RocketIcon,
  SignInIcon,
  SolanaIcon,
  // SignalIcon,
  TradeIcon,
  TranslateIcon,
  TokenIcon,
  WalletIcon,
  cn,
  useScreen,
  Button,
  ChevronDownIcon,
  Kbd,
  SearchIcon,
  type LinkComponentType,
} from "@liberfi.io/ui";
import * as UiScaffold from "@liberfi.io/ui-scaffold";
import { SEARCH_MODAL_ID, SearchModal } from "@liberfi.io/ui-tokens";
import {
  chainDisplayName,
  formatAmount,
  truncateAddress,
  type PredefinedToken,
} from "@liberfi.io/utils";
import {
  resolveHeaderNavigationKey,
  useShellChrome,
} from "../application/layout-chrome";
import {
  TOKEN_DETAIL_SOURCE_QUERY_PARAM,
  tokenDetailRoute,
} from "../application/routes";
import { useCreateOnrampWidgetUrlMutation } from "../application/server/useCreateOnrampWidgetUrlMutation";
import { queryClient } from "../libs/queryClient";
import { AuthProviders } from "./AuthProviders";
import { useChainAwareRouter } from "../hooks/useChainAwareRouter";
import { useChainUrlSync } from "../hooks/useChainUrlSync";
import { useChainSwitchUrlHandler } from "../hooks/useChainSwitchUrlHandler";
import { ChainAwareLink } from "./ChainAwareLink";
import {
  applicationLocaleProviderProps,
  createApplicationLocaleRuntime,
} from "../runtime/createApplicationLocaleRuntime";
import { PresetFormModal } from "@liberfi.io/ui-trade";
import { useAccountInfo } from "@liberfi.io/ui-portfolio";
import { LaunchPadModal, LAUNCHPAD_MODAL_ID } from "./modals/LaunchPadModal";
import {
  DEPOSIT_HL_USDC_MODAL_ID,
  DepositHyperliquidUsdcModal,
} from "./modals/DepositHyperliquidUsdcModal";
import { ReceiveModal, RECEIVE_MODAL_ID } from "./modals/ReceiveModal";
import { WebviewModal } from "./modals/WebviewModal";
import { WithdrawModal, WITHDRAW_MODAL_ID } from "./modals/WithdrawModal";
import { useHyperliquidBalances } from "../hooks/useHyperliquidBalances";
import { HyperliquidUsdcIcon } from "./icons/HyperliquidUsdcIcon";
import { CashInOutlinedIcon } from "./icons/CashInOutlinedIcon";
import { ReceiveOutlinedIcon } from "./icons/ReceiveOutlinedIcon";
import { SendOutlinedIcon } from "./icons/SendOutlinedIcon";
// TODO: Re-enable when the Convert (闪兑) flow is ready.
// import { ConvertOutlinedIcon } from "./icons/ConvertOutlinedIcon";
import { AppBottomToolbar } from "./AppBottomToolbar";
import { BottomTweets } from "./BottomTweets";
import { BottomAICopilot } from "./BottomAICopilot";
import { PredictBalanceIndicator } from "./PredictBalanceIndicator";
import { FundWalletModal } from "./FundWalletModal";
import { isPulseSupportedChain } from "../lib/pulse";
import { AppRuntimeProviders } from "../runtime/AppRuntimeProviders";
import {
  HEADER_CONTROL_CLASS,
  HEADER_CONTROL_SURFACE_CLASS,
  HEADER_ICON_CONTROL_CLASS,
} from "./header-control-theme";
import { resolveHeaderLanguageOption } from "./header-language-selection";

const { Scaffold, ScaffoldHeader, ScaffoldFooter, Logo, DraggablePanelProvider } = UiScaffold;
type NavItem = UiScaffold.NavItem;

const RuntimeLocaleProvider = LocaleProvider as ComponentType<LocaleProviderProps>;
const UnpublishedScaffold = UiScaffold as typeof UiScaffold & {
  ModalCoordinatorProvider: ComponentType<PropsWithChildren>;
  DraggableStateProvider: ComponentType<PropsWithChildren>;
};
const ModalCoordinatorProvider = UnpublishedScaffold.ModalCoordinatorProvider;
const DraggableStateProvider = UnpublishedScaffold.DraggableStateProvider;
const useAsyncModal = UiScaffold.useAsyncModal;

const navItemsConfig: Omit<NavItem, "label">[] = [
  { key: "discover", href: "/", icon: <HomeIcon width={20} height={20} /> },
  { key: "pulse", href: "/pulse", icon: <PulseIcon width={20} height={20} /> },
  { key: "perpetuals", href: "/perpetuals", icon: <TradeIcon width={20} height={20} /> },
  { key: "predict", href: "/predict", icon: <CoinsIcon width={20} height={20} /> },
  // { key: "channels", href: "/channels", icon: <SignalIcon width={20} height={20} /> },
  { key: "portfolio", href: "/portfolio", icon: <WalletIcon width={20} height={20} /> },
];

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export function NewAppLayout({ children, locale }: PropsWithChildren<{ locale: LocaleCode }>) {
  const [localeRuntime] = useState(() => createApplicationLocaleRuntime(locale));
  return (
    <ModalCoordinatorProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProviders>
          <RuntimeLocaleProvider
            {...applicationLocaleProviderProps(localeRuntime)}
            locale={locale}
            supportedLanguages={["en", "zh"]}
          >
            <AppRuntimeProviders>
              <PageShell>{children}</PageShell>
              <LaunchPadModal />
              <DepositHyperliquidUsdcModal />
              <ReceiveModal />
              <WithdrawModal />
              <WebviewModal />
              <StyledToaster />
              <SearchModal />
              <PredictSearchModal />
              <PresetFormModal />
            </AppRuntimeProviders>
          </RuntimeLocaleProvider>
        </AuthProviders>
      </QueryClientProvider>
    </ModalCoordinatorProvider>
  );
}

// ---------------------------------------------------------------------------
// Page shell (withPage — Scaffold with header / footer)
// ---------------------------------------------------------------------------

function PageShell({ children }: PropsWithChildren) {
  useChainUrlSync();
  const { t } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useChainAwareRouter();
  const { chain } = useCurrentChain();
  const { headerVisible, footerVisible } = useShellChrome();
  const tokenDetailSource = searchParams.get(TOKEN_DETAIL_SOURCE_QUERY_PARAM);
  const activeNavigationKey = resolveHeaderNavigationKey(
    pathname,
    tokenDetailSource,
  );

  const navItems: NavItem[] = useMemo(
    () =>
      navItemsConfig
        .filter((item) => item.key !== "pulse" || isPulseSupportedChain(chain))
        .map((item) => ({
          ...item,
          label: t(`extend.nav.${item.key}`) as string,
        })),
    [chain, t],
  );

  const onNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  const switchChain = useSwitchEvmWalletsToChain();
  const onChainSwitchedUrl = useChainSwitchUrlHandler();
  const { status: authStatus } = useAuth();

  const isPredictPage = pathname.startsWith("/predict");
  // The Hyperliquid balance trigger only makes sense inside the perpetuals
  // experience. Hiding it elsewhere keeps the header from advertising a
  // venue the user isn't currently interacting with.
  const isPerpetualsPage = pathname.startsWith("/perpetuals");
  const isAuthenticated = authStatus === "authenticated";

  const { onOpen: openPredictSearch, onClose: closePredictSearch } =
    useAsyncModal(PREDICT_SEARCH_MODAL_ID);
  const { onOpen: openTokenSearch, onClose: dismissTokenSearch } = useAsyncModal(SEARCH_MODAL_ID);

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

  const handleSelectPredictEvent = useCallback(
    (event: PredictEvent) => {
      router.push(predictEventHref(event));
      closePredictSearch();
    },
    [router, closePredictSearch],
  );

  const handleHeaderSelectChain = useCallback(
    async (c: Chain, selectChain: (chain: Chain) => Promise<void>) => {
      if (pathname.startsWith("/tokens")) {
        onChainSwitchedUrl(c);
        toast.success(
          t("common.chainSwitched", {
            chain: chainDisplayName(c),
          }),
        );
        return;
      }

      await selectChain(c);
    },
    [onChainSwitchedUrl, pathname, t],
  );

  const handleSelectToken = useCallback(
    (token: Token) => {
      router.push(
        tokenDetailRoute(token.chain, token.address, {
          source: activeNavigationKey === "pulse" ? "pulse" : undefined,
        }),
      );
    },
    [activeNavigationKey, router],
  );

  const openActiveSearch = useCallback(async () => {
    if (isPredictPage) {
      const event = await openPredictSearch({ params: searchModalParams });
      if (event) {
        handleSelectPredictEvent(event as PredictEvent);
      }
      return;
    }

    const token = await openTokenSearch({ params: { chains: [chain] } });
    if (token) {
      handleSelectToken(token as Token);
    }
  }, [
    chain,
    handleSelectPredictEvent,
    handleSelectToken,
    isPredictPage,
    openPredictSearch,
    openTokenSearch,
    searchModalParams,
  ]);

  const closeActiveSearch = useCallback(() => {
    if (isPredictPage) {
      closePredictSearch();
      return;
    }

    dismissTokenSearch();
  }, [closePredictSearch, dismissTokenSearch, isPredictPage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isTextInput =
        !!activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.getAttribute("contenteditable") === "true");

      if (event.key === "/" && !isTextInput) {
        event.preventDefault();
        openActiveSearch();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeActiveSearch();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeActiveSearch, openActiveSearch]);

  const searchLabel = t(
    isPredictPage ? "predict.search.placeholder" : "tokens.search.placeholder",
  ) as string;

  return (
    <PredictWalletProvider enabled={isPredictPage}>
      {/* FundWalletModal must live INSIDE PredictWalletProvider because it
          calls usePredictWallet() during render. Rendering it as a sibling of
          PageShell (outside the provider) would crash with "usePredictWallet
          must be used within a PredictWalletProvider" the moment the user
          opens the deposit dialog. */}
      <FundWalletModal />
      <DraggableStateProvider>
        <Scaffold
          pathname={pathname}
          onNavigate={onNavigate}
          headerVisible={headerVisible}
          footerVisible={footerVisible}
          toolbar={<AppBottomToolbar />}
          toolbarVisible={["desktop"]}
          header={
            <ScaffoldHeader>
              <div className="w-full h-full px-6 max-lg:px-4 max-sm:px-3 flex items-center gap-6 max-lg:gap-4 max-sm:gap-2">
                {/* Left: Logo + desktop nav tabs */}
                <div className="shrink-0 flex items-center gap-1">
                  <Logo icon={<LogoIcon />} miniIcon={<MiniLogoIcon />} />
                  <div className="hidden sm:flex items-center gap-1 ml-2">
                    {navItems.map((item) => {
                      const active = item.key === activeNavigationKey;
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
                  <HeaderSearchButton
                    variant="desktop"
                    label={searchLabel}
                    onPress={openActiveSearch}
                    className="max-lg:hidden"
                  />
                </div>

                {/* Right: search icon (tablet/mobile) + chain select + launchpad + language + account */}
                <div className="shrink-0 ml-auto flex items-center gap-2">
                  <HeaderSearchButton
                    variant="mobile"
                    label={searchLabel}
                    onPress={openActiveSearch}
                    className="lg:hidden"
                  />

                  {/* Chain selector is always shown — including on the predict
                    module — so users can manage their underlying on-chain
                    wallet (which funds Polymarket / Kalshi deposits) without
                    leaving the predict experience. */}
                  <ChainSelectDropdown
                    candidates={[Chain.SOLANA, Chain.ETHEREUM, Chain.BINANCE]}
                    onSwitchChain={switchChain}
                    onSelectChain={handleHeaderSelectChain}
                    onSuccess={(c) => {
                      onChainSwitchedUrl(c);
                      toast.success(
                        t("common.chainSwitched", {
                          chain: chainDisplayName(c),
                        }),
                      );
                    }}
                    onError={(e) =>
                      toast.error(e instanceof Error ? e.message : t("common.chainSwitchFailed"))
                    }
                  />

                  {/* Global utility cluster — chain switch, launchpad
                    entry, language switch — stays together on the left
                    of the right-hand action group on every page,
                    including the predict module. Page-specific actions
                    (predict balance / deposit, perpetuals HL balance,
                    wallet account) come after this cluster. */}
                  <LaunchPadButton />

                  <div className="hidden sm:block">
                    <LanguageButton />
                  </div>

                  {/* On the predict module the balance indicator is the
                    single header entry for prediction-market wallets:
                    its dropdown carries per-venue deposit / withdraw
                    actions inline, so a standalone header deposit
                    button would just duplicate functionality and clutter
                    the action cluster.

                    Predict-specific account info (addresses + KYC /
                    Setup status) is also merged into this same
                    dropdown, so the predict module needs nothing extra
                    here — the on-chain wallet trigger (DexAccountButton)
                    below covers funding the underlying chain wallet,
                    same as every other module. */}
                  {isPredictPage && isAuthenticated && <PredictBalanceIndicator />}
                  {!isPredictPage && isPerpetualsPage && <HyperliquidBalanceButton />}
                  <DexAccountButton />
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
      </DraggableStateProvider>
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
    <ChainAwareLink
      href={item.href}
      prefetch
      data-active={active}
      className={cn(
        "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        active ? "text-primary" : "text-text-muted hover:bg-content2 hover:text-foreground",
      )}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
    >
      {item.label}
    </ChainAwareLink>
  );
}

// ---------------------------------------------------------------------------
// Header action buttons — all 32px tall, rounded-full
// ---------------------------------------------------------------------------

function HeaderSearchButton({
  variant,
  label,
  onPress,
  className,
}: {
  variant: "desktop" | "mobile";
  label: string;
  onPress: () => void;
  className?: string;
}) {
  if (variant === "desktop") {
    return (
      <Button
        size="sm"
        radius="full"
        onPress={onPress}
        variant="bordered"
        startContent={<SearchIcon width={16} height={16} />}
        endContent={
          <Kbd className="min-w-6 justify-center rounded-lg bg-surface-strong text-xs text-text-secondary">
            /
          </Kbd>
        }
        className={cn(
          HEADER_CONTROL_CLASS,
          "w-56 min-w-0 pl-3 pr-1.5",
          className,
        )}
      >
        {label}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      radius="full"
      isIconOnly
      onPress={onPress}
      variant="bordered"
      aria-label={label}
      className={cn(HEADER_CONTROL_CLASS, HEADER_ICON_CONTROL_CLASS, className)}
    >
      <SearchIcon width={16} height={16} />
    </Button>
  );
}

const DROPDOWN_STYLE: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid var(--color-border-control)",
  background: "var(--color-surface-interactive)",
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
      className={cn(
        HEADER_CONTROL_CLASS,
        HEADER_ICON_CONTROL_CLASS,
        "text-brand-primary hover:text-brand-primary",
      )}
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
  const selectedLocale = resolveHeaderLanguageOption(locale, languages);

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
        className={cn(HEADER_CONTROL_CLASS, HEADER_ICON_CONTROL_CLASS)}
      >
        <TranslateIcon width={14} height={14} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 z-50 overflow-hidden" style={DROPDOWN_STYLE}>
          <div className="p-1">
            {languages.map((lang) => {
              const selected = lang.localCode === selectedLocale;
              return (
                <button
                  key={lang.localCode}
                  type="button"
                  onClick={() => handleSelect(lang.localCode as LocaleCode)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-sm transition-all cursor-pointer",
                    selected
                      ? "bg-action-primary/[0.08] text-brand-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-strong/50",
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
  onSelectChain,
  onSuccess,
  onError,
}: {
  className?: string;
  candidates: Chain[];
  onSwitchChain?: (chain: Chain) => Promise<void>;
  onSelectChain?: (chain: Chain, selectChain: (chain: Chain) => Promise<void>) => Promise<void>;
  onSuccess?: (chain: Chain) => void;
  onError?: (error: unknown) => void;
}) {
  const { chain } = useCurrentChain();

  const { isDesktop } = useScreen();

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
      if (onSelectChain) {
        await onSelectChain(c, selectChain);
      } else {
        await selectChain(c);
      }
      setIsOpen(false);
    },
    [chain, onSelectChain, selectChain],
  );

  return (
    <div className={cn("relative", className)} ref={ref}>
      {isDesktop ? (
        <Button
          size="sm"
          radius="full"
          variant="bordered"
          onPress={() => setIsOpen(!isOpen)}
          className={cn(HEADER_CONTROL_CLASS, "px-3")}
          startContent={<ChainIcon chain={chain} size={18} />}
          endContent={
            <ChevronDownIcon
              width={16}
              height={16}
              className={cn(
                "text-text-muted transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />
          }
          disableRipple
          disabled={isSwitching}
        >
          {chainDisplayName(chain)}
        </Button>
      ) : (
        <Button
          size="sm"
          radius="full"
          variant="bordered"
          onPress={() => setIsOpen(!isOpen)}
          isIconOnly
          className={cn(HEADER_CONTROL_CLASS, HEADER_ICON_CONTROL_CLASS, "max-lg:hidden")}
          disableRipple
          disabled={isSwitching}
        >
          <ChainIcon chain={chain} size={18} />
        </Button>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 z-50 overflow-hidden" style={DROPDOWN_STYLE}>
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
                      ? "bg-action-primary/[0.08] text-brand-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-strong/50",
                  )}
                >
                  <ChainIcon chain={c} size={18} />
                  <span className="flex-1 text-left">{chainDisplayName(c)}</span>
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
  return <div style={{ width: size, height: size }} className="rounded-full bg-surface-interactive" />;
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
  const hash = seed ? seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
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
    balanceNativeFormatted,
    nativeToken,
    chainNamespace,
    walletAddress,
  } = useAccountInfo();

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
        className={cn(
          HEADER_CONTROL_CLASS,
          "gap-1.5 px-3 text-xs font-semibold text-brand-primary hover:text-brand-primary",
        )}
      >
        <SignInIcon width={14} height={14} />
        {t("common.signIn")}
      </button>
    );
  }

  if (status === "authenticating" || status === "deauthenticating") {
    return (
      <div className={cn(HEADER_CONTROL_SURFACE_CLASS, HEADER_ICON_CONTROL_CLASS)}>
        <span className="inline-block w-4 h-4 border-[2px] border-border-control border-t-brand-primary rounded-full animate-spin" />
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
        className={cn(HEADER_CONTROL_CLASS, "gap-1.5 px-2.5")}
      >
        {nativeToken && <TokenIcon symbol={nativeToken.symbol} size={16} />}
        <span className="text-xs font-medium text-text-primary tabular-nums">
          {balanceNativeFormatted}
          {!isMobile && nativeToken && (
            <span className="text-text-muted ml-1">{nativeToken.symbol}</span>
          )}
        </span>
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
            "text-text-muted transition-transform duration-200",
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
          <div className="absolute inset-0 bg-surface-scrim" />
          <div
            className="relative w-full max-w-sm mb-safe animate-in slide-in-from-bottom duration-200"
            style={{
              borderRadius: "14px 14px 0 0",
              border: "1px solid var(--color-border-control)",
              borderBottom: "none",
              background: "var(--color-surface-interactive)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full bg-surface-strong" />
            </div>
            <DexAccountMenuContent
              walletAddress={walletAddress}
              chainNamespace={chainNamespace}
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
        <div className="absolute right-0 mt-2 w-72 z-50 overflow-hidden" style={DROPDOWN_STYLE}>
          <DexAccountMenuContent
            walletAddress={walletAddress}
            chainNamespace={chainNamespace}
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

// ---------------------------------------------------------------------------
// HyperliquidBalanceButton — shows only Hyperliquid USDC balance in trigger
// ---------------------------------------------------------------------------

function HyperliquidBalanceButton() {
  const { isMobile } = useScreen();
  const { status } = useAccountInfo();

  const wallets = useWallets();
  const evmWallet = useMemo(
    () => wallets.find((w) => w.chainNamespace === "EVM") as EvmWalletAdapter | undefined,
    [wallets],
  );
  const evmAddress = evmWallet?.address;
  const hlBalances = useHyperliquidBalances(evmAddress);

  const [isOpen, setIsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!evmAddress) return;
    await navigator.clipboard.writeText(evmAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [evmAddress]);

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

  const { onOpen: openHlDeposit } = useAsyncModal(DEPOSIT_HL_USDC_MODAL_ID);
  const handleDeposit = useCallback(() => {
    setIsOpen(false);
    void openHlDeposit();
  }, [openHlDeposit]);

  // Only render when authenticated and an EVM wallet is connected
  if (status !== "authenticated" || !evmAddress) return null;

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
        className={cn(HEADER_CONTROL_CLASS, "gap-1.5 px-2.5")}
      >
        <HyperliquidUsdcIcon size={16} />
        <span className="text-xs font-medium text-text-primary tabular-nums">
          {formatHlUsdc(hlBalances.perpUsdc)}
          {!isMobile && <span className="text-text-muted ml-1">USDC</span>}
        </span>
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
            "text-text-muted transition-transform duration-200",
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
          <div className="absolute inset-0 bg-surface-scrim" />
          <div
            className="relative w-full max-w-sm mb-safe animate-in slide-in-from-bottom duration-200"
            style={{
              borderRadius: "14px 14px 0 0",
              border: "1px solid var(--color-border-control)",
              borderBottom: "none",
              background: "var(--color-surface-interactive)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-8 h-1 rounded-full bg-surface-strong" />
            </div>
            <HyperliquidAccountMenuContent
              evmAddress={evmAddress}
              availableMargin={hlBalances.availableMargin}
              accountValue={hlBalances.accountValue}
              copied={copied}
              onCopy={handleCopy}
              onDeposit={handleDeposit}
            />
            <div className="pb-safe" />
          </div>
        </div>
      )}

      {/* Tablet & Desktop: popover */}
      {!isMobile && isOpen && (
        <div className="absolute right-0 mt-2 w-72 z-50 overflow-hidden" style={DROPDOWN_STYLE}>
          <HyperliquidAccountMenuContent
            evmAddress={evmAddress}
            availableMargin={hlBalances.availableMargin}
            accountValue={hlBalances.accountValue}
            copied={copied}
            onCopy={handleCopy}
            onDeposit={handleDeposit}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HyperliquidAccountMenuContent — content shown inside the Hyperliquid
// balance dropdown. Intentionally not sharing layout with
// `DexAccountMenuContent`: that one is the per-chain wallet menu (receive
// / withdraw / convert / buy + sign out), while this one is a focused
// Hyperliquid summary with a single Deposit CTA.
// ---------------------------------------------------------------------------

function HyperliquidAccountMenuContent({
  evmAddress,
  availableMargin,
  accountValue,
  copied,
  onCopy,
  onDeposit,
}: {
  evmAddress: string;
  availableMargin: number;
  accountValue: number;
  copied: boolean;
  onCopy: () => void;
  onDeposit: () => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      {/* EVM address + Hyperliquid balance summary */}
      <div className="p-2">
        <div className="w-full flex items-start gap-3 px-3 py-3.5 rounded-[10px] hover:bg-surface-strong/50 transition-all">
          {/* Avatar size matches the Dex wallet dropdown for visual
              consistency; top-aligned with the address row to keep a
              clean horizontal baseline regardless of how many balance
              rows are shown. */}
          <GradientAvatar seed={evmAddress} size={44} className="rounded-xl shrink-0" />
          <div className="flex-1 min-w-0">
            {/* Row 1: EVM address (always 0x…) + copy */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-secondary truncate">
                {truncateAddress(evmAddress)}
              </span>
              <button
                type="button"
                className="p-1 rounded hover:bg-surface-strong text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Copy Address"
                onClick={onCopy}
              >
                {copied ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                )}
              </button>
            </div>
            {/* Row 2: available margin (withdrawable) */}
            <div className="flex items-center justify-between gap-2 text-xs mt-1.5">
              <span className="text-text-muted">{t("perpetuals.placeOrder.availableMargin")}</span>
              <span className="text-text-secondary tabular-nums font-medium">
                {formatHlUsdc(availableMargin)} <span className="text-text-muted">USDC</span>
              </span>
            </div>
            {/* Row 3: account value (totalEquity) */}
            <div className="flex items-center justify-between gap-2 text-xs mt-1">
              <span className="text-text-muted">
                {t("perpetuals.placeOrder.perpsAccountValue")}
              </span>
              <span className="text-text-secondary tabular-nums font-medium">
                {formatHlUsdc(accountValue)} <span className="text-text-muted">USDC</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Single deposit CTA — replaces the wallet menu's action row +
          sign-out section. Keeps the chrome/colour of a secondary row
          rather than a primary brand button, so the dropdown stays
          information-first. */}
      <div style={{ borderTop: "1px solid var(--color-border-control)" }} className="p-2">
        <button
          type="button"
          onClick={onDeposit}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-[10px] transition-colors cursor-pointer text-text-primary hover:bg-surface-strong/60"
        >
          {/* Icon matches the "Buy / 购买" action in the Dex wallet
              dropdown to keep the "add funds" affordance visually
              consistent across both menus. */}
          <div className="flex items-center justify-center w-7 h-7 rounded-[10px] bg-surface-strong text-text-secondary">
            <CashInOutlinedIcon width={16} height={16} />
          </div>
          {t("hlDeposit.entryShort")}
        </button>
      </div>
    </>
  );
}

function DexAccountMenuContent({
  walletAddress,
  chainNamespace,
  balanceNativeFormatted,
  nativeToken,
  copied,
  onCopy,
  onSignOut,
}: {
  walletAddress: string;
  chainNamespace: string;
  balanceNativeFormatted: string;
  nativeToken: PredefinedToken | undefined;
  copied: boolean;
  onCopy: () => void;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  const { chain } = useCurrentChain();
  const { onOpen: openReceiveModal } = useAsyncModal(RECEIVE_MODAL_ID);
  const { onOpen: openWithdrawModal } = useAsyncModal(WITHDRAW_MODAL_ID);
  const { mutate: createOnrampWidgetUrl, isPending: isCreatingOnramp } =
    useCreateOnrampWidgetUrlMutation();

  // Open the fiat on-ramp widget in a new browser tab. The widget URL is
  // single-use and minted server-side by dex-server (POST /api/onramp/
  // widget-url → strategy-routed to Transak or another configured
  // provider). The on-ramp purchases the chain's native token (SOL / ETH /
  // BNB) so the prefilled token matches the wallet shown in this dropdown.
  // To survive popup blockers — which would otherwise strip `window.open`
  // calls made after an `await` — we open `about:blank` synchronously
  // inside the click handler and patch its `location` once the mutation
  // resolves.
  const handleAddCash = useCallback(() => {
    if (!walletAddress || isCreatingOnramp) return;

    const win = window.open("about:blank", "_blank");
    if (win) {
      win.opener = null;
    }

    createOnrampWidgetUrl(
      { chain, walletAddress, cryptoCurrency: nativeToken?.symbol },
      {
        onSuccess: (data) => {
          if (win && !win.closed) {
            win.location.href = data.widgetUrl;
          } else {
            window.open(data.widgetUrl, "_blank", "noopener,noreferrer");
          }
        },
        onError: (err) => {
          if (win && !win.closed) {
            win.close();
          }
          toast.error(err.message || t("account.add_cash_failed"));
        },
      },
    );
  }, [chain, walletAddress, nativeToken, isCreatingOnramp, createOnrampWidgetUrl, t]);

  return (
    <>
      {/* Wallet address + copy */}
      <div className="p-2">
        <div className="w-full flex items-center gap-3 px-3 py-3.5 rounded-[10px] hover:bg-surface-strong/50 transition-all">
          <GradientAvatar seed={walletAddress} size={44} className="rounded-xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-secondary truncate">
                {walletAddress ? truncateAddress(walletAddress) : "—"}
              </span>
              {walletAddress && (
                <button
                  type="button"
                  className="p-1 rounded hover:bg-surface-strong text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  title="Copy Address"
                  onClick={onCopy}
                >
                  {copied ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  )}
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs mt-2">
              <span className="text-text-muted">
                {t("account.nativeTotalBalance" as never, {
                  symbol: nativeToken?.symbol ?? chainNamespace.toUpperCase(),
                })}
              </span>
              {nativeToken && <TokenIcon symbol={nativeToken.symbol} size={16} />}
              <span className="text-text-secondary tabular-nums font-medium">
                {balanceNativeFormatted}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ borderTop: "1px solid var(--color-border-control)" }} className="px-2 py-3">
        <div className="flex items-center justify-around">
          <WalletActionButton
            icon={<ReceiveOutlinedIcon width={18} height={18} />}
            label={t("account.receive")}
            onClick={() => openReceiveModal()}
          />
          <WalletActionButton
            icon={<SendOutlinedIcon width={18} height={18} />}
            label={t("account.withdraw")}
            onClick={() => openWithdrawModal()}
          />
          {/* TODO: Re-enable when the Convert (闪兑) flow is ready.
          <WalletActionButton
            icon={<ConvertOutlinedIcon width={18} height={18} />}
            label={t("account.convert")}
          />
          */}
          <WalletActionButton
            icon={<CashInOutlinedIcon width={18} height={18} />}
            label={t("account.add_cash")}
            onClick={handleAddCash}
          />
        </div>
      </div>

      {/* Sign out */}
      <div style={{ borderTop: "1px solid var(--color-border-control)" }} className="p-2">
        <button
          type="button"
          onClick={onSignOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-[10px] transition-colors cursor-pointer text-danger hover:bg-danger/10"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-[10px] bg-danger/10">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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

function WalletActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 px-4 cursor-pointer group"
    >
      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-strong/60 text-text-secondary group-hover:bg-surface-strong group-hover:text-text-primary transition-colors">
        {icon}
      </div>
      <span className="text-xs text-text-muted group-hover:text-text-secondary transition-colors whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

function formatHlUsdc(value: string | number): string {
  const n = typeof value === "number" ? value : Number(value);
  return formatAmount(Number.isFinite(n) ? n : 0);
}
