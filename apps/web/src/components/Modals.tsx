import { SettingsModal, TradeSettingsModal } from "@liberfi/ui-dex";
import { LaunchPadModal } from "@liberfi/ui-launchpad";
import { lazy, Suspense } from "react";

const modals = [
  lazy(() => import("@liberfi/ui-dex/dist/components/modals/SearchModal")),
  lazy(() => import("@liberfi/ui-dex/dist/components/modals/WebviewModal")),
  lazy(() => import("@liberfi/ui-dex/dist/components/modals/ReceiveModal")),
  lazy(() => import("@liberfi/ui-dex/dist/components/modals/AssetSelectModal")),
  lazy(() => import("@liberfi/ui-dex/dist/components/modals/TokenSelectModal")),
  lazy(() => import("@liberfi/ui-dex/dist/components/modals/SwapModal")),
  lazy(() => import("@liberfi/ui-dex/dist/components/modals/LanguageModal")),
  lazy(() => import("@liberfi/ui-dex/dist/components/modals/TransferModal")),
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
