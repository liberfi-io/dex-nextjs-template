import { useCallback, useState } from "react";

export const usePaste = () => {
  const [text, setText] = useState("");
  const [error, setError] = useState<Error | null>(null);

  const paste = useCallback(async () => {
    try {
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
