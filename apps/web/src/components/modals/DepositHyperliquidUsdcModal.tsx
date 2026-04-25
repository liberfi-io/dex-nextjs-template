"use client";

/**
 * Deposit Hyperliquid USDC modal.
 *
 * Hyperliquid's only native USDC inbound channel is **Arbitrum One USDC** —
 * users must send native USDC on Arbitrum to either:
 *   1. Their own Hyperliquid 0x address on Arbitrum (then they
 *      manually push it into the Perp account from the Hyperliquid app /
 *      a separate "deposit to Perp" step), or
 *   2. The Hyperliquid bridge contract directly (only safe when the
 *      sender wallet is the user's HL 0x address).
 *
 * For an externally-funded UX (CEX withdrawal, scan-to-pay from another
 * wallet) we present option (1): show the user's HL 0x address with a QR
 * code and copy button, plus clear "Arbitrum One / native USDC" hints.
 *
 * No backend / proxy is involved — this modal does not call Hyperunit.
 */

import { useCallback, useMemo, useState } from "react";
import encodeQR from "@paulmillr/qr";
import { useTranslation } from "@liberfi.io/i18n";
import {
  CheckIcon,
  CopyIcon,
  ModalContent,
  StyledModal,
  XCloseIcon,
  cn,
} from "@liberfi.io/ui";
import {
  AsyncModal,
  type RenderAsyncModalProps,
} from "@liberfi.io/ui-scaffold";
import {
  useWallets,
  type EvmWalletAdapter,
} from "@liberfi.io/wallet-connector";

import { HyperliquidUsdcIcon } from "../icons/HyperliquidUsdcIcon";
import { useHyperliquidBalances } from "../../hooks/useHyperliquidBalances";

export const DEPOSIT_HL_USDC_MODAL_ID = "deposit-hyperliquid-usdc";

const ARBITRUM_USDC_NATIVE = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const HL_BRIDGE_CONTRACT = "0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7";
const ARBISCAN_BASE = "https://arbiscan.io/address";
const MIN_DEPOSIT_USDC = 5;

export function DepositHyperliquidUsdcModal() {
  return (
    <AsyncModal id={DEPOSIT_HL_USDC_MODAL_ID}>
      {(props) => <Body {...props} />}
    </AsyncModal>
  );
}

function Body({ isOpen, onOpenChange, onClose }: RenderAsyncModalProps) {
  const { t } = useTranslation();
  const wallets = useWallets();
  const evm = useMemo(
    () =>
      wallets.find((w) => w.chainNamespace === "EVM") as
        | EvmWalletAdapter
        | undefined,
    [wallets],
  );
  const address = evm?.address;
  const balances = useHyperliquidBalances(address);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    onClose?.();
  }, [onOpenChange, onClose]);

  return (
    <StyledModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="sm"
      hideCloseButton
      backdrop="blur"
      classNames={{
        base: "!bg-[#18181b] !rounded-[14px] !border !border-[rgba(39,39,42,1)] !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-[440px]",
        body: "!p-0",
      }}
    >
      <ModalContent>
        <div className="flex flex-col">
          <div className="flex items-start justify-between px-5 pt-5 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-[12px] bg-[#97FCE4]/10">
                <HyperliquidUsdcIcon size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  {t("extend.hlDeposit.title")}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {t("extend.hlDeposit.subtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-[10px] hover:bg-[rgba(39,39,42,0.5)] text-zinc-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <XCloseIcon width={16} height={16} />
            </button>
          </div>

          {address ? (
            <div className="px-5 pb-5 pt-3 flex flex-col gap-3">
              <div className="flex justify-center pt-1">
                <QRCodeImage value={address} />
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                  {t("extend.hlDeposit.depositAddress")}
                </div>
                <CopyAddressRow address={address} />
              </div>

              <div className="rounded-[10px] border border-[rgba(39,39,42,0.8)] bg-[#0a0a0b] divide-y divide-[rgba(39,39,42,0.8)]">
                <InfoRow
                  label={t("extend.hlDeposit.network")}
                  value={t("extend.hlDeposit.networkValue")}
                />
                <InfoRow
                  label={t("extend.hlDeposit.asset")}
                  value={t("extend.hlDeposit.assetValue")}
                  href={`${ARBISCAN_BASE}/${ARBITRUM_USDC_NATIVE}`}
                />
                <InfoRow
                  label={t("extend.hlDeposit.minDeposit")}
                  value={`${MIN_DEPOSIT_USDC} USDC`}
                />
              </div>

              <div className="rounded-[10px] bg-amber-500/5 border border-amber-500/20 px-3 py-2.5">
                <p className="text-xs text-amber-300 leading-relaxed">
                  {t("extend.hlDeposit.warning")}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-[10px] bg-zinc-800/30 border border-zinc-700/40 px-3 py-2.5">
                <span className="text-xs text-zinc-400">
                  {t("extend.hlDeposit.perpBalance")}
                </span>
                <div className="flex items-center gap-1.5">
                  <HyperliquidUsdcIcon size={14} />
                  <span className="text-sm font-medium text-[#c7ff2e] tabular-nums">
                    {formatUsdcDisplay(balances.perpUsdc)} USDC
                  </span>
                </div>
              </div>

              <a
                href={`${ARBISCAN_BASE}/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] border border-zinc-700/50 bg-zinc-800/60 hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-colors"
              >
                {t("extend.hlDeposit.viewOnArbiscan")}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>

              <p className="text-[11px] text-zinc-500 leading-relaxed text-center px-2">
                {t("extend.hlDeposit.bridgeHint", {
                  bridge: shortenAddr(HL_BRIDGE_CONTRACT),
                })}
              </p>
            </div>
          ) : (
            <div className="px-5 pb-6 pt-3">
              <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <p className="text-sm text-zinc-300">
                  {t("extend.hlDeposit.notConnected")}
                </p>
              </div>
            </div>
          )}
        </div>
      </ModalContent>
    </StyledModal>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function QRCodeImage({ value }: { value: string }) {
  const svgString = useMemo(() => {
    try {
      return encodeQR(value, "svg", { ecc: "high" });
    } catch {
      return null;
    }
  }, [value]);

  if (!svgString) return null;

  return (
    <div
      className="rounded-[10px] overflow-hidden border border-zinc-700 bg-white p-2"
      style={{ width: 184, height: 184 }}
      dangerouslySetInnerHTML={{ __html: svgString }}
      aria-hidden="true"
    />
  );
}

function CopyAddressRow({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore — clipboard may be blocked in some browser contexts
    }
  }, [address]);

  return (
    <div className="flex items-center gap-2 bg-zinc-800/50 rounded-[10px] px-3 py-2 border border-zinc-700/50">
      <span className="flex-1 font-mono text-xs text-zinc-300 truncate">
        {address}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="p-1.5 rounded-[10px] hover:bg-[rgba(39,39,42,0.5)] text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
        aria-label="Copy address"
      >
        {copied ? (
          <CheckIcon width={14} height={14} className="text-[#c7ff2e]" />
        ) : (
          <CopyIcon width={14} height={14} />
        )}
      </button>
    </div>
  );
}

function InfoRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 text-xs">
      <span className="text-zinc-500">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-zinc-200 hover:text-[#c7ff2e] transition-colors inline-flex items-center gap-1",
          )}
        >
          {value}
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      ) : (
        <span className="text-zinc-200">{value}</span>
      )}
    </div>
  );
}

function shortenAddr(s: string): string {
  if (s.length < 12) return s;
  return `${s.slice(0, 6)}...${s.slice(-4)}`;
}

function formatUsdcDisplay(s: string): string {
  const n = Number(s);
  if (!Number.isFinite(n)) return "0.00";
  if (n === 0) return "0.00";
  if (n < 0.01) return n.toFixed(6);
  return n.toFixed(2);
}

export default DepositHyperliquidUsdcModal;
