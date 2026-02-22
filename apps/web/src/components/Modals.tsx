import { SettingsModal, TradeSettingsModal } from "@liberfi/ui-dex";
import { LaunchPadModal } from "@liberfi/ui-launchpad";
import { lazy, Suspense } from "react";

const modals = [
  lazy(() => import("@liberfi/ui-dex/components/modals/SearchModal")),
  lazy(() => import("@liberfi/ui-dex/components/modals/WebviewModal")),
  lazy(() => import("@liberfi/ui-dex/components/modals/ReceiveModal")),
  lazy(() => import("@liberfi/ui-dex/components/modals/AssetSelectModal")),
  lazy(() => import("@liberfi/ui-dex/components/modals/TokenSelectModal")),
  lazy(() => import("@liberfi/ui-dex/components/modals/SwapModal")),
  lazy(() => import("@liberfi/ui-dex/components/modals/LanguageModal")),
  lazy(() => import("@liberfi/ui-dex/components/modals/TransferModal")),
];

export function Modals() {
  return (
    <>
      <Suspense>
        {modals.map((Modal, index) => (
          <Modal key={index} />
        ))}
      </Suspense>
      <SettingsModal />
      <TradeSettingsModal />
      <LaunchPadModal />
    </>
  );
}
