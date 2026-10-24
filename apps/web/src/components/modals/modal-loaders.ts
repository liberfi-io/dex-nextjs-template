import type { ComponentType } from "react";

type ModalLoader = () => Promise<ComponentType>;

export const loadLaunchPadModal: ModalLoader = () =>
  import("./LaunchPadModal").then((module) => module.LaunchPadModal);
export const loadReceiveModal: ModalLoader = () =>
  import("./ReceiveModal").then((module) => module.ReceiveModal);
export const loadWithdrawModal: ModalLoader = () =>
  import("./WithdrawModal").then((module) => module.WithdrawModal);
export const loadDepositHyperliquidUsdcModal: ModalLoader = () =>
  import("./DepositHyperliquidUsdcModal").then(
    (module) => module.DepositHyperliquidUsdcModal,
  );
export const loadFundWalletModal: ModalLoader = () =>
  import("../FundWalletModal").then((module) => module.FundWalletModal);
export const loadTokenSearchModal: ModalLoader = () =>
  import("@liberfi.io/ui-tokens").then((module) => module.SearchModal);
export const loadPredictSearchModal: ModalLoader = () =>
  import("@liberfi.io/ui-predict").then((module) => module.PredictSearchModal);
export const loadPresetFormModal: ModalLoader = () =>
  import("@liberfi.io/ui-trade").then((module) => module.PresetFormModal);
