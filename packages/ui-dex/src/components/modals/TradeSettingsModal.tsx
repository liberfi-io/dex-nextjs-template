import { Modal, useTranslation } from "@liberfi/ui-base";
import { TradeSettings } from "../trade";

/**
 * Global modal for trade settings
 */
export function TradeSettingsModal() {
  const { t } = useTranslation();
  return (
    <Modal id="trade_settings:open" header={t("extend.trade.settings.title")}>
      {(onClose: () => void, args?: { preset?: number; type?: "buy" | "sell" }) => (
        <TradeSettings onSettings={onClose} preset={args?.preset} type={args?.type} />
      )}
    </Modal>
  );
}
