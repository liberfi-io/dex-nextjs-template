import { useAppSdk } from "@liberfi/ui-base";
import { atom, useAtom } from "jotai";
import { useCallback, useEffect } from "react";

const historiesAtom = atom<string[]>([]);

export function useSearchHistories() {
  const appSdk = useAppSdk();

  const [histories, setHistories] = useAtom(historiesAtom);

  useEffect(() => {
    appSdk.storage.get<string>("search_histories").then((value) => {
      const histories = JSON.parse(value || "[]");
      setHistories(histories);
    });
  }, [appSdk, setHistories]);

  const addHistory = useCallback(
    (history: string) => {
      if (history) {
        setHistories((prev) => {
          if (prev.includes(history)) {
            prev.splice(prev.indexOf(history), 1);
          }
          const newHistories = [history, ...prev].slice(0, 10);
          appSdk.storage.set("search_histories", JSON.stringify(newHistories));
          return newHistories;
        });
      }
    },
    [setHistories, appSdk],
  );

  const clearHistories = useCallback(() => {
    setHistories([]);
    appSdk.storage.delete("search_histories");
  }, [setHistories, appSdk]);

  return { histories, addHistory, clearHistories };
}
