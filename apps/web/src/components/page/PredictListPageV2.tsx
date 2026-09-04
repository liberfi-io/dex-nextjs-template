"use client";

import { useCallback } from "react";
import { useChainAwareRouter } from "../../hooks/useChainAwareRouter";
import { ChainAwareLink } from "../ChainAwareLink";
import { useTranslation } from "@liberfi.io/i18n";
import { toast, type LinkComponentType } from "@liberfi.io/ui";
import { EventsPage } from "@liberfi.io/ui-predict";
import type { PredictEvent, ProviderSource } from "@liberfi.io/react-predict";
import {
  FUND_WALLET_MODAL_ID,
  type FundWalletParams,
} from "../fund-wallet-modal.contract";
import { useDeferredAsyncModal } from "../modals/DeferredAsyncModalHost";
import { loadFundWalletModal } from "../modals/modal-loaders";
import { predictEventHref } from "./predict-source";

const NoPrefetchLink: LinkComponentType = (props) => (
  <ChainAwareLink prefetch={false} {...props} />
);

export function PredictListPageV2() {
  const router = useChainAwareRouter();
  const { t } = useTranslation();
  const { onOpen: openFundWallet } =
    useDeferredAsyncModal<FundWalletParams>(
      FUND_WALLET_MODAL_ID,
      loadFundWalletModal,
    );

  const handleSelect = useCallback(
    (event: PredictEvent) => {
      router.push(predictEventHref(event));
    },
    [router],
  );

  const handleHover = useCallback(
    (event: PredictEvent) => {
      router.prefetch(predictEventHref(event));
    },
    [router],
  );

  const handleInsufficientBalance = useCallback(
    (source: ProviderSource) => {
      toast.error(t("predict.trade.insufficientBalance"));
      openFundWallet({
        params: {
          initialScreen: "deposit",
          initialWallet: source === "polymarket" ? "evm" : "solana",
        },
      });
    },
    [openFundWallet, t],
  );

  return (
    <EventsPage
      getEventHref={(event: PredictEvent) => predictEventHref(event)}
      LinkComponent={NoPrefetchLink}
      onHover={handleHover}
      onSelect={handleSelect}
      bgImageSrc="/matches-bg-wide.png"
      onInsufficientBalance={handleInsufficientBalance}
    />
  );
}
