import { useAppSdk, useAuth, useTranslation } from "@liberfi/ui-base";
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { AssetSelect } from "../account";
import { getBuyTokenUrl } from "@/libs";
import { CHAIN_ID } from "@liberfi/core";

export default function AssetSelectModal() {
  const { t, i18n } = useTranslation();

  const { user } = useAuth();

  const appSdk = useAppSdk();

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [requestId, setRequestId] = useState<number | undefined>(undefined);

  const [chainId, setChainId] = useState<CHAIN_ID | undefined>(undefined);

  const [exceptTokenAddresses, setExceptTokenAddresses] = useState<string[]>([]);

  useEffect(() => {
    const handler = ({
      id,
      params,
    }: {
      method: "select_asset";
      id?: number | undefined;
      params: { chainId?: CHAIN_ID; except_token_addresses?: string[] };
    }) => {
      setRequestId(id);
      setChainId(params.chainId);
      setExceptTokenAddresses(params.except_token_addresses ?? []);
      onOpen();
    };
    appSdk.events.on("select_asset", handler);
    return () => {
      appSdk.events.off("select_asset", handler);
    };
  }, [onOpen, appSdk]);

  const onReceive = useCallback(() => {
    onClose();
    appSdk.events.emit("deposit:open");
  }, [appSdk, onClose]);

  const onBuy = useCallback(() => {
    onClose();
    const url = getBuyTokenUrl({
      chainId: CHAIN_ID.SOLANA,
      walletAddress: user?.solanaAddress ?? "",
      language: i18n.language,
    });
    appSdk.openPage(url, {
      title: t("extend.account.add_cash"),
      target: "modal",
    });
  }, [appSdk, i18n, t, user, onClose]);

  const onSelect = useCallback(
    (tokenAddress: string) => {
      onClose();
      appSdk.events.emit("response", {
        method: "response",
        id: requestId,
        params: { tokenAddress },
      });
    },
    [appSdk, onClose, requestId],
  );

  return (
    <Modal
      isOpen={isOpen}
      size="lg"
      onOpenChange={onOpenChange}
      hideCloseButton
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent className="bg-content2 rounded-lg">
        <ModalHeader>{t("extend.account.select_asset")}</ModalHeader>
        <ModalBody>
          <AssetSelect
            onReceive={onReceive}
            onBuy={onBuy}
            onSelect={onSelect}
            chainId={chainId}
            exceptTokenAddresses={exceptTokenAddresses}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
