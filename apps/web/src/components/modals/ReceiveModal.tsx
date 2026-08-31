"use client";

import { useCallback, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { useTranslation } from "@liberfi.io/i18n";
import { ModalContent, StyledModal, TokenIcon, XCloseIcon } from "@liberfi.io/ui";
import { AsyncModal, type RenderAsyncModalProps } from "@liberfi.io/ui-scaffold";
import { useCurrentChain } from "@liberfi.io/ui-chain-select";
import { useAccountInfo } from "@liberfi.io/ui-portfolio";
import { chainDisplayName, type PredefinedToken } from "@liberfi.io/utils";

export const RECEIVE_MODAL_ID = "receive-wallet";

export function ReceiveModal() {
  return <AsyncModal id={RECEIVE_MODAL_ID}>{(props) => <Body {...props} />}</AsyncModal>;
}

function Body({ isOpen, onOpenChange, onClose }: RenderAsyncModalProps) {
  const { t } = useTranslation();
  const { walletAddress, nativeToken } = useAccountInfo();
  const { chain } = useCurrentChain();
  const chainName = chainDisplayName(chain);

  const [copied, setCopied] = useState(false);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    onClose?.();
  }, [onOpenChange, onClose]);

  const handleCopy = useCallback(async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  return (
    <StyledModal
      isOpen={isOpen}
      onOpenChange={(next) => !next && handleClose()}
      size="md"
      hideCloseButton
      backdrop="blur"
      classNames={{
        base: "!bg-surface-interactive !rounded-[14px] !border !border-border-control !shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-[420px]",
        body: "!p-0",
      }}
    >
      <ModalContent>
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-[12px] bg-surface-strong/40">
                <TokenIconOrFallback token={nativeToken} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  {t("account.receive")}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {t("account.receive_warning_chain", { chain: chainName })}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-[10px] hover:bg-surface-strong/50 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Close"
            >
              <XCloseIcon width={16} height={16} />
            </button>
          </div>

          {/* QR Code */}
          <div className="flex justify-center px-5 py-4">
            <div
              className="flex items-center justify-center rounded-[14px] bg-white p-4"
              style={{ width: 220, height: 220 }}
            >
              <QRCode
                size={188}
                value={walletAddress || " "}
                bgColor="transparent"
                fgColor="#09090b"
                qrStyle="dots"
                eyeRadius={{ inner: 2, outer: 10 }}
              />
            </div>
          </div>

          {/* Address + copy */}
          <div className="px-5 pb-5">
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-[12px]"
              style={{
                background: "var(--color-surface-base)",
                border: "1px solid var(--color-border-control)",
              }}
            >
              <span className="flex-1 text-xs text-text-secondary break-all leading-relaxed tabular-nums">
                {walletAddress || "—"}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label={
                  copied
                    ? t("account.copied" as never)
                    : t("account.copy_address" as never)
                }
                className="flex-shrink-0 flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] text-xs font-medium transition-colors cursor-pointer bg-surface-strong/60 hover:bg-surface-strong text-text-secondary hover:text-text-primary"
              >
                {copied ? (
                  <>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{t("account.copied" as never)}</span>
                  </>
                ) : (
                  <>
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
                    <span>{t("account.copy_address" as never)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </ModalContent>
    </StyledModal>
  );
}

function TokenIconOrFallback({ token }: { token: PredefinedToken | undefined }) {
  if (!token) {
    return <div className="w-5 h-5 rounded-full bg-surface-emphasis" />;
  }
  return <TokenIcon symbol={token.symbol} size={22} />;
}
