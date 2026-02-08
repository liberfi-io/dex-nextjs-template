"use client";

import { useCallback, useState } from "react";

export const usePaste = () => {
  const [text, setText] = useState("");
  const [error, setError] = useState<Error | null>(null);

  const paste = useCallback(async () => {
    try {
      if (!navigator || !navigator.clipboard) {
        throw new Error("Clipboard is not supported");
      }
      setText("");
      const text = await navigator.clipboard.readText();
      setText(text);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setText("");
    }
  }, [setText, setError]);

  return { text, error, paste };
};
