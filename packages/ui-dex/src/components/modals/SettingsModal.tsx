import { Modal, useTranslation } from "@liberfi/ui-base";
import { Settings } from "../account";

/**
 * Global modal for the settings
 */
export function SettingsModal() {
  const { t } = useTranslation();
  return (
    <Modal id="settings:open" header={t("extend.header.settings")} layoutSizes={{ mobile: "full" }}>
      {(onClose: () => void) => <Settings onSetting={onClose} />}
    </Modal>
  );
}
