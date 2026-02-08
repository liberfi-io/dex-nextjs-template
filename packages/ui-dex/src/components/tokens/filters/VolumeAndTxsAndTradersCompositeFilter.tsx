import { useTokenListContext } from "../TokenListContext";
import { useCallback, useEffect, useState } from "react";
import { VolumeFilterForm } from "./VolumeFilterForm";
import { TxsFilterForm } from "./TxsFilterForm";
import { TradersFilterForm } from "./TradersFilterForm";
import { ListFilter } from "@/components/ListFilter";

export function VolumeAndTxsAndTradersCompositeFilter() {
  const { filters, setFilters } = useTokenListContext();

  const [volume, setVolume] = useState("");

  const [txs, setTxs] = useState("");

  const [traders, setTraders] = useState("");

  useEffect(() => {
    setVolume(filters["volume"] ?? "");
    setTxs(filters["txs"] ?? "");
    setTraders(filters["traders"] ?? "");
  }, [filters, setVolume, setTxs, setTraders]);

  const handleClose = useCallback(() => {
    setVolume(filters["volume"] ?? "");
    setTxs(filters["txs"] ?? "");
    setTraders(filters["traders"] ?? "");
  }, [filters, setVolume, setTxs, setTraders]);

  const handleApply = useCallback(() => {
    const combinedFilters: Record<string, string> = {};

    let same = true;
    if ((filters["volume"] ?? "") !== volume) {
      if (volume) combinedFilters["volume"] = volume;
      same = false;
    } else {
      if (volume) combinedFilters["volume"] = volume;
    }

    if ((filters["txs"] ?? "") !== txs) {
      if (txs) combinedFilters["txs"] = txs;
      same = false;
    } else {
      if (txs) combinedFilters["txs"] = txs;
    }

    if ((filters["traders"] ?? "") !== traders) {
      if (traders) combinedFilters["traders"] = traders;
      same = false;
    } else {
      if (traders) combinedFilters["traders"] = traders;
    }

    if (!same) {
      setFilters(combinedFilters);
    }
  }, [filters, setFilters, volume, txs, traders]);

  const handleClear = useCallback(() => {
    setVolume("");
    setTxs("");
    setTraders("");
  }, [setVolume, setTxs, setTraders]);

  return (
    <ListFilter
      active={!!filters["volume"] || !!filters["txs"] || !!filters["traders"]}
      onApply={handleApply}
      onClear={handleClear}
      onClose={handleClose}
    >
      <VolumeFilterForm value={volume} onValueChange={setVolume} />
      <TxsFilterForm className="mt-4" value={txs} onValueChange={setTxs} />
      <TradersFilterForm className="mt-4" value={traders} onValueChange={setTraders} />
    </ListFilter>
  );
}
