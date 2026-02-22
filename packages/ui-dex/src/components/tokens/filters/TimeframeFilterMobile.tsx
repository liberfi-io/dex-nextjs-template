import { ArrowDownIcon } from "../../../assets";
import { useTranslation } from "@liberfi/ui-base";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tab,
  Tabs,
  useDisclosure,
} from "@heroui/react";
import { Key, useCallback } from "react";
import { TIMEFRAMES } from "./TimeframeFilter";
import { useTokenListContext } from "../TokenListContext";

export function TimeframeFilterMobile() {
  const { t } = useTranslation();

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const { timeframe, setTimeframe } = useTokenListContext();

  const handleSelect = useCallback(
    (tf: string) => {
      setTimeframe(tf);
      onClose();
    },
    [setTimeframe, onClose],
  );

  return (
    <>
      <Button
        className="flex lg:hidden min-w-0 h-9 min-h-9 px-0 gap-1 bg-transparent text-neutral text-xs"
        onPress={onOpen}
        disableRipple
        endContent={
          <ArrowDownIcon
            className="data-[open=true]:rotate-180 transition-transform"
            data-open={isOpen}
          />
        }
      >
        {t(`extend.token_list.filters.timeframe.${timeframe}`)}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton scrollBehavior="inside">
        <ModalContent className="bg-content2 rounded-lg">
          <ModalHeader>{t("extend.token_list.filters.timeframe.title")}</ModalHeader>
          <ModalBody className="pb-12">
            <Tabs
              classNames={{
                base: "border-1 border-content3 rounded-lg",
                cursor: "bg-primary/20 dark:bg-primary/20",
              }}
              fullWidth
              selectedKey={timeframe}
              onSelectionChange={handleSelect as (key: Key) => void}
            >
              {TIMEFRAMES.map((tf) => (
                <Tab key={tf} title={t(`extend.token_list.filters.timeframe.${tf}`)} />
              ))}
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
