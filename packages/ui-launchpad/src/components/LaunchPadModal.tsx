import { Modal, useTranslation } from "@liberfi/ui-base";
import { LaunchPadHome } from "./LaunchPadHome";

/**
 * Global modal for the launchpad.
 */
export function LaunchPadModal() {
  const { t } = useTranslation();
  return (
    <Modal
      id="launchpad:open"
      size="full"
      layoutSizes={{ desktop: "4xl" }}
      isDismissable={false}
      layoutClassNames={{
        desktop: {
          // fixed height for desktop
          base: "h-[calc(100%_-_8rem)]",
        },
      }}
      header={t("extend.launchpad.title")}
    >
      {(_onClose: () => void, args: any) => (
        <LaunchPadHome prompt={args?.prompt} image={args?.image} />
      )}
    </Modal>
  );
}
