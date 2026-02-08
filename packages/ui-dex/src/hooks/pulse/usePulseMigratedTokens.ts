import { usePulseListContext } from "@/components/pulse/PulseListContext";
import { Token } from "@chainstream-io/sdk";
import { useMigratedTokensQuery } from "@liberfi/react-dex";
import { chainAtom } from "@liberfi/ui-base";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";

export function usePulseMigratedTokens() {
  const chain = useAtomValue(chainAtom);

  const { isPaused } = usePulseListContext();

  const { data, isPending } = useMigratedTokensQuery({ chain }, { refetchInterval: 30e3 });

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
              next.unshift(it);
            }
          }
        });
        return next;
      });
    }
  }, [data, isPaused]);

  return useMemo(() => (isPending ? undefined : tokens), [tokens, isPending]);
}
