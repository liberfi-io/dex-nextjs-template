import { useTokenListContext } from "../TokenListContext";
import { useCallback, useEffect, useState } from "react";
import { MarketCapFilterForm } from "./MarketCapFilterForm";
import { LiquidityFilterForm } from "./LiquidityFilterForm";
import { ListFilter } from "../../ListFilter";

export function MarketCapAndLiquidityCompositeFilter() {
  const { filters, setFilters } = useTokenListContext();

  const [marketCap, setMarketCap] = useState("");

  const [liquidity, setLiquidity] = useState("");

  useEffect(() => {
    setMarketCap(filters["market_cap"] ?? "");
    setLiquidity(filters["liquidity"] ?? "");
  }, [filters, setMarketCap, setLiquidity]);

  const handleClose = useCallback(() => {
    setMarketCap(filters["market_cap"] ?? "");
    setLiquidity(filters["liquidity"] ?? "");
  }, [filters, setMarketCap, setLiquidity]);

  const handleApply = useCallback(() => {
    const combinedFilters: Record<string, string> = {};

    let same = true;
    if ((filters["market_cap"] ?? "") !== marketCap) {
      if (marketCap) combinedFilters["market_cap"] = marketCap;
      same = false;
    } else {
      if (marketCap) combinedFilters["market_cap"] = marketCap;
    }

    if ((filters["liquidity"] ?? "") !== liquidity) {
      if (liquidity) combinedFilters["liquidity"] = liquidity;
      same = false;
    } else {
      if (liquidity) combinedFilters["liquidity"] = liquidity;
    }

    if (!same) {
      setFilters(combinedFilters);
    }
  }, [filters, setFilters, marketCap, liquidity]);

  const handleClear = useCallback(() => {
    setMarketCap("");
    setLiquidity("");
  }, [setMarketCap, setLiquidity]);

  return (
    <ListFilter
      active={!!filters["market_cap"] || !!filters["liquidity"]}
      onApply={handleApply}
      onClear={handleClear}
      onClose={handleClose}
    >
      <MarketCapFilterForm value={marketCap} onValueChange={setMarketCap} />
      <LiquidityFilterForm className="mt-4" value={liquidity} onValueChange={setLiquidity} />
    </ListFilter>
  );
}
