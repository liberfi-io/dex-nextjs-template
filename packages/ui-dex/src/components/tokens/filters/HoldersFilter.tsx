import { useTokenListContext } from "../TokenListContext";
import { useCallback, useEffect, useState } from "react";
import { HoldersFilterForm } from "./HoldersFilterForm";
import { ListFilter } from "@/components/ListFilter";

export function HoldersFilter() {
  const { filters, setFilters } = useTokenListContext();

  const [holders, setHolders] = useState("");

  useEffect(() => {
    setHolders(filters["holders"] ?? "");
  }, [filters, setHolders]);

  const handleClose = useCallback(() => {
    setHolders(filters["holders"] ?? "");
  }, [filters, setHolders]);

  const handleApply = useCallback(() => {
    if ((filters["holders"] ?? "") !== holders) {
      setFilters(holders ? { holders } : {});
    }
  }, [filters, setFilters, holders]);

  const handleClear = useCallback(() => {
    setHolders("");
  }, [setHolders]);

  return (
    <ListFilter
      active={!!filters["holders"]}
      onApply={handleApply}
      onClear={handleClear}
      onClose={handleClose}
    >
      <HoldersFilterForm value={holders} onValueChange={setHolders} />
    </ListFilter>
  );
}
