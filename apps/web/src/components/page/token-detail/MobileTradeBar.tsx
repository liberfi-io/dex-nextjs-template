"use client";

import {
  Modal,
  ModalContent,
  useDisclosure,
} from "@heroui/react";
import { cn } from "@liberfi.io/ui";
import { useTranslation } from "@liberfi/ui-base";
import { useCallback, useState } from "react";
import type { Chain } from "@liberfi.io/types";
import { TradingPanel } from "./TradingPanel";

export interface MobileTradeBarProps {
  chain: Chain;
  tokenAddress: string;
  /** Token symbol — used for the modal's aria-label only. */
  tokenSymbol?: string;
}

type Direction = "buy" | "sell";

/**
 * Mobile-only sticky trade bar — mirrors GMGN's mobile pattern.
 *
 * Layout (fixed to the viewport bottom, above the system safe-area):
 *
 *   ┌────────────────────────────────────────────────┐
 *   │ [   買入 (bullish)   ] [   賣出 (bearish)   ]  │
 *   └────────────────────────────────────────────────┘
 *
 * Tapping either CTA opens a HeroUI `Modal` placed at the bottom of the
 * screen, containing the full {@link TradingPanel}. The tapped direction
 * is forwarded to `InstantTrade` via the new `defaultDirection` prop so
 * the panel opens already on the correct tab (Buy / Sell).
 *
 * Why a modal instead of the desktop "always-on sidebar" pattern: GMGN's
 * mobile keeps the chart + holders list dominant on first paint; the
 * full trade form is one tap away rather than permanently consuming ~240
 * px of viewport. The component reuses {@link TradingPanel} verbatim, so
 * styles, balance display, presets, and the in-panel direction tablist
 * all stay identical to desktop.
 *
 * The bar itself is intentionally compact (≈64px including safe-area
 * padding). Consumers reserve the same amount of `padding-bottom` on the
 * page scroll container so the last list row isn't obscured.
 */
export function MobileTradeBar({
  chain,
  tokenAddress,
  tokenSymbol,
}: MobileTradeBarProps) {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  // Remember which CTA opened the sheet so the modal seeds InstantTrade
  // with the matching tab. Default to "buy" for the very first paint
  // before any user interaction.
  const [direction, setDirection] = useState<Direction>("buy");

  const handleOpen = useCallback(
    (next: Direction) => {
      setDirection(next);
      onOpen();
    },
    [onOpen],
  );

  return (
    <>
      <nav
        aria-label={tokenSymbol ? `Trade ${tokenSymbol}` : "Trade"}
        // pb-[max(...)] adds the system home-indicator inset on iOS while
        // keeping a reasonable minimum on Android / browsers without the
        // env() variable.
        className="fixed bottom-0 left-0 right-0 z-30 flex gap-2.5 border-t border-divider bg-content1 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
      >
        <TradeCta
          direction="buy"
          label={t("extend.trade.buy")}
          onPress={() => handleOpen("buy")}
        />
        <TradeCta
          direction="sell"
          label={t("extend.trade.sell")}
          onPress={() => handleOpen("sell")}
        />
      </nav>

      <TradeSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={onClose}
        direction={direction}
        chain={chain}
        tokenAddress={tokenAddress}
      />
    </>
  );
}

function TradeCta({
  direction,
  label,
  onPress,
}: {
  direction: Direction;
  label: string;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "h-11 flex-1 rounded-md text-[15px] font-semibold transition-opacity active:opacity-80",
        // Buy = bullish surface w/ black text; Sell = bearish.
        // Match the desktop trade-panel tab colours so the sheet's
        // selected tab visually flows from the tapped CTA.
        direction === "buy"
          ? "bg-bullish text-black"
          : "bg-bearish text-black",
      )}
    >
      {label}
    </button>
  );
}

function TradeSheet({
  isOpen,
  onOpenChange,
  onClose,
  direction,
  chain,
  tokenAddress,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  direction: Direction;
  chain: Chain;
  tokenAddress: string;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
      placement="bottom"
      backdrop="blur"
      hideCloseButton
      scrollBehavior="inside"
      classNames={{
        // Sheet styling — pinned to the bottom edge, full-width, with a
        // small grab-handle and rounded top corners. We override
        // HeroUI's default 24px page margin with `m-0` so the sheet
        // truly touches the viewport bottom on iOS Safari (the
        // browser chrome already accounts for the safe area).
        wrapper: "items-end justify-center sm:items-center",
        base: "m-0 max-w-full rounded-t-2xl rounded-b-none border-t border-divider bg-content1 sm:max-w-md sm:rounded-2xl",
        body: "p-0",
      }}
    >
      <ModalContent>
        {/* Drag handle — a centred 36×4 pill that mirrors native
            iOS / GMGN sheet ergonomics. Purely decorative; the modal
            close is via backdrop tap or scroll dismiss. */}
        <div className="flex justify-center pt-2.5 pb-1">
          <span className="block h-1 w-9 rounded-full bg-content3" />
        </div>
        <TradingPanel
          chain={chain}
          tokenAddress={tokenAddress}
          defaultDirection={direction}
        />
      </ModalContent>
    </Modal>
  );
}
