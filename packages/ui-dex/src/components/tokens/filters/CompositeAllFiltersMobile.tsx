import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { FilterIcon } from "@/assets";
import { useTranslation } from "@liberfi/ui-base";
import clsx from "clsx";
import { useTokenListContext } from "../TokenListContext";
import { PriceChangeFilterForm } from "./PriceChangeFilterForm";
import { MarketCapFilterForm } from "./MarketCapFilterForm";
import { LiquidityFilterForm } from "./LiquidityFilterForm";
import { HoldersFilterForm } from "./HoldersFilterForm";
import { VolumeFilterForm } from "./VolumeFilterForm";
import { TxsFilterForm } from "./TxsFilterForm";
import { TradersFilterForm } from "./TradersFilterForm";
import { AgeFilterForm } from "./AgeFilterForm";

const COMPOSITE_FILTERS = [
  "price_change",
  "market_cap",
  "liquidity",
  "holders",
  "volume",
  "txs",
  "traders",
  "age",
];

export function CompositeAllFiltersMobile() {
  const { t } = useTranslation();

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const { filters, setFilters } = useTokenListContext();

  const active = useMemo(() => COMPOSITE_FILTERS.some((key) => !!filters[key]), [filters]);

  const [compositeFilters, setCompositeFilters] = useState<Record<string, string>>({});

  const useHandleValue = (key: string) =>
    useCallback(
      (value: string) =>
        setCompositeFilters((prev) =>
          (prev[key] ?? "") !== value ? { ...prev, [key]: value } : prev,
        ),
      [key],
    );

  const handlePriceChangeValue = useHandleValue("price_change");
  const handleMarketCapValue = useHandleValue("market_cap");
  const handleLiquidityValue = useHandleValue("liquidity");
  const handleHoldersValue = useHandleValue("holders");
  const handleVolumeValue = useHandleValue("volume");
  const handleTxsValue = useHandleValue("txs");
  const handleTradersValue = useHandleValue("traders");
  const handleAgeValue = useHandleValue("age");

  const handleApply = useCallback(() => {
    setFilters(compositeFilters);
    onClose();
  }, [compositeFilters, setFilters, onClose]);

  const handleClear = useCallback(() => setCompositeFilters({}), []);

  useEffect(() => setCompositeFilters(filters), [filters]);

  // restore filters when closing
  const handleClose = useCallback(() => {
    setCompositeFilters(filters);
    onClose();
  }, [onClose, filters]);

  return (
    <>
      <Button
        isIconOnly
        className={clsx(
          "flex w-5 min-w-5 h-5 min-h-5 bg-transparent text-neutral",
          active && "text-bullish",
        )}
        disableRipple
        onPress={onOpen}
      >
        <FilterIcon width={18} height={18} />
      </Button>
      <Modal
        isOpen={isOpen}
        scrollBehavior="inside"
        onOpenChange={onOpenChange}
        hideCloseButton
        onClose={handleClose}
        backdrop="blur"
      >
        <ModalContent className="bg-content2 rounded-lg">
          <ModalHeader>{t("extend.token_list.filters.title")}</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <PriceChangeFilterForm
                value={compositeFilters["price_change"]}
                onValueChange={handlePriceChangeValue}
              />
              <MarketCapFilterForm
                value={compositeFilters["market_cap"]}
                onValueChange={handleMarketCapValue}
              />
              <LiquidityFilterForm
                value={compositeFilters["liquidity"]}
                onValueChange={handleLiquidityValue}
              />
              <HoldersFilterForm
                value={compositeFilters["holders"]}
                onValueChange={handleHoldersValue}
              />
              <VolumeFilterForm
                value={compositeFilters["volume"]}
                onValueChange={handleVolumeValue}
              />
              <TxsFilterForm value={compositeFilters["txs"]} onValueChange={handleTxsValue} />
              <TradersFilterForm
                value={compositeFilters["traders"]}
                onValueChange={handleTradersValue}
              />
              <AgeFilterForm value={compositeFilters["age"]} onValueChange={handleAgeValue} />
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="w-full flex items-center justify-center gap-4">
              <Button
                className="flex basis-[calc(25%-10px)] bg-transparent text-neutral border-1 border-content3"
                onPress={handleClear}
                disableRipple
              >
                {t("extend.token_list.filters.clear")}
              </Button>
              <Button
                className="flex basis-[calc(75%-10px)]"
                color="primary"
                onPress={handleApply}
                disableRipple
              >
                {t("extend.token_list.filters.apply")}
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
