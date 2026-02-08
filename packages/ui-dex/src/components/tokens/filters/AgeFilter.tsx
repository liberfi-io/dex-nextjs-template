import { ListFilter } from "@/components/ListFilter";
import { useTokenListContext } from "../TokenListContext";
import { useCallback, useEffect, useState } from "react";
import { AgeFilterForm } from "../filters";

export function AgeFilter() {
  const { filters, setFilters } = useTokenListContext();

  const [age, setAge] = useState("");

  useEffect(() => {
    setAge(filters["age"] ?? "");
  }, [filters, setAge]);

  const handleClose = useCallback(() => {
    setAge(filters["age"] ?? "");
  }, [filters, setAge]);

  const handleApply = useCallback(() => {
    if ((filters["age"] ?? "") !== age) {
      setFilters(age ? { age } : {});
    }
  }, [filters, setFilters, age]);

  const handleClear = useCallback(() => {
    setAge("");
  }, [setAge]);

  return (
    <ListFilter
      active={!!filters["age"]}
      onApply={handleApply}
      onClear={handleClear}
      onClose={handleClose}
    >
      <AgeFilterForm value={age} onValueChange={setAge} />
    </ListFilter>
  );
}
