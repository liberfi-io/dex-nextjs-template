import { useEffect, useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { chainAtom } from "@liberfi/ui-base";
import { useFinalStretchTokensQuery } from "@liberfi/react-dex";
import { usePulseListContext } from "@/components/pulse/PulseListContext";
import { Token } from "@chainstream-io/sdk";
import { sortBy } from "lodash-es";

export function usePulseFinalStretchTokens() {
  const chain = useAtomValue(chainAtom);

  const { isPaused } = usePulseListContext();

  const { data, isPending } = useFinalStretchTokensQuery({ chain }, { refetchInterval: 15e3 });

  // token list
  const [tokens, setTokens] = useState<Token[]>([]);

  // merge newest tokens to the list
  useEffect(() => {
    if (data) {
      setTokens((prev) => {
        const next = [...prev];
        data.forEach((it) => {
          const idx = next.findIndex((t) => t.address === it.address);
          if (idx >= 0) {
            next[idx] = it;
          } else {
            if (!isPaused) {
              next.push(it);
            }
          }
        });
        const sorted = sortBy(next, "marketData.completionRatio").reverse();
        return sorted;
      });
    }
  }, [data, isPaused]);

  return useMemo(() => (isPending ? undefined : tokens), [tokens, isPending]);
}
