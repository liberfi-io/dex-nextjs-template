import { useTokenListContext } from "../TokenListContext";
import { useCallback, useEffect, useState } from "react";
import { PriceChangeFilterForm } from "./PriceChangeFilterForm";
import { ListFilter } from "@/components/ListFilter";

export function PriceChangeFilter() {
  const { filters, setFilters } = useTokenListContext();

  const [priceChange, setPriceChange] = useState("");

  useEffect(() => {
    setPriceChange(filters["price_change"] ?? "");
  }, [filters, setPriceChange]);

  const handleClose = useCallback(() => {
    setPriceChange(filters["price_change"] ?? "");
  }, [filters, setPriceChange]);

  const handleApply = useCallback(() => {
    if ((filters["price_change"] ?? "") !== priceChange) {
      setFilters(priceChange ? { price_change: priceChange } : {});
    }
  }, [filters, setFilters, priceChange]);

  const handleClear = useCallback(() => {
    setPriceChange("");
  }, [setPriceChange]);

  return (
    <ListFilter
      active={!!filters["price_change"]}
      onApply={handleApply}
      onClear={handleClear}
      onClose={handleClose}
    >
      <PriceChangeFilterForm value={priceChange} onValueChange={setPriceChange} />
    </ListFilter>
  );
}
