import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface TokenListContextType {
  keyword: string;
  type: string;
  subType: string;
  timeframe: string;
  chainId: string;
  filters: Record<string, string>;
  sort: Record<string, "asc" | "desc">;
  setKeyword: (keyword: string) => void;
  setType: (type: string, subType?: string) => void;
  setTimeframe: (timeframe: string) => void;
  setChainId: (chainId: string) => void;
  setFilters: (filters: Record<string, string>) => void;
  setSort: (sort: Record<string, "asc" | "desc">) => void;
}

export const TokenListContext = createContext<TokenListContextType>({
  keyword: "",
  type: "",
  subType: "",
  timeframe: "",
  chainId: "",
  filters: {},
  sort: {},
  setKeyword: () => {},
  setType: () => {},
  setTimeframe: () => {},
  setChainId: () => {},
  setFilters: () => {},
  setSort: () => {},
});

export function TokenListProvider({ children }: PropsWithChildren) {
  const [keyword, setKeyword] = useState("");
  const [type, setMainType] = useState("discover");
  const [subType, setSubType] = useState("trending");
  const [timeframe, setTimeframe] = useState("24h");
  const [chainId, setChainId] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<Record<string, "asc" | "desc">>({});

  const setType = useCallback(
    (type: string, subType?: string) => {
      setMainType(type);
      setSubType(subType || "");
      setSort({});
      setFilters({});
    },
    [setMainType, setSubType, setSort],
  );

  const value = useMemo(
    () => ({
      keyword,
      type,
      subType,
      timeframe,
      chainId,
      filters,
      sort,
      setKeyword,
      setType,
      setTimeframe,
      setChainId,
      setFilters,
      setSort,
    }),
    [
      keyword,
      type,
      subType,
      timeframe,
      chainId,
      filters,
      sort,
      setKeyword,
      setType,
      setTimeframe,
      setChainId,
      setFilters,
      setSort,
    ],
  );

  return <TokenListContext.Provider value={value}>{children}</TokenListContext.Provider>;
}

export function useTokenListContext() {
  return useContext(TokenListContext);
}
