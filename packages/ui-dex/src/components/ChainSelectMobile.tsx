import { ChainImage, NetworkIcon } from "../assets";
import { useTranslation } from "@liberfi/ui-base";
import { capitalize } from "../libs";
import {
  Button,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { Chain } from "@liberfi/core";
import { chainSlug } from "@liberfi.io/utils";
import { ChainOption, CHAINS } from "./ChainSelect";
import { useCallback } from "react";
import clsx from "clsx";

export type ChainSelectMobileProps = {
  classNames?: {
    trigger?: string;
  };
  chainId?: Chain | "";
  onSelect?: (chain: Chain | "") => void;
};

export function ChainSelectMobile({ classNames, chainId, onSelect }: ChainSelectMobileProps) {
  const { t } = useTranslation();

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const handleSelect = useCallback(
    (chain: Chain | "") => {
      onSelect?.(chain);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <>
      <Button
        isIconOnly
        className={clsx(
          "flex lg:hidden w-9 min-w-0 h-9 min-h-9 rounded-full bg-content1 text-neutral",
          classNames?.trigger,
        )}
        onPress={onOpen}
        disableRipple
      >
        {chainId ? (
          <ChainImage chainId={chainId as Chain} width={22} height={22} />
        ) : (
          <NetworkIcon
            className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2"
            width={20}
            height={20}
          />
        )}
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        hideCloseButton
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent className="bg-content2 rounded-lg">
          <ModalHeader>{t("extend.token_list.filters.chain.select_chain")}</ModalHeader>
          <ModalBody>
            <Listbox
              aria-label={t("extend.token_list.filters.chain.select_chain")}
              classNames={{
                base: "p-0",
                list: "gap-2.5",
              }}
            >
              <>
                <ListboxItem
                  key={""}
                  textValue={t("extend.token_list.filters.chain.universal_chains")}
                  className="p-0 data-[selected=true]:focus:bg-transparent"
                  onPress={() => handleSelect("")}
                >
                  <ChainOption
                    className="h-14"
                    classNames={{ label: "text-sm" }}
                    isSelected={!chainId}
                    label={t("extend.token_list.filters.chain.universal_chains")}
                    icon={
                      <div className="w-6 h-6 flex items-center justify-center">
                        <NetworkIcon width={20} height={20} />
                      </div>
                    }
                  />
                </ListboxItem>
                {CHAINS.map((chain) => (
                  <ListboxItem
                    key={chain}
                    textValue={capitalize(chainSlug(chain as Chain)!)}
                    className={
                      "p-0 data-[selected=true]:focus:bg-transparent " +
                      "data-[hover=true]:opacity-hover data-[hover=true]:bg-transparent"
                    }
                    onPress={() => handleSelect(chain)}
                  >
                    <ChainOption
                      className="h-14"
                      classNames={{ label: "text-sm" }}
                      isSelected={chainId === chain}
                      label={capitalize(chainSlug(chain as Chain)!)}
                      icon={<ChainImage chainId={chain} width={24} height={24} />}
                    />
                  </ListboxItem>
                ))}
              </>
            </Listbox>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
