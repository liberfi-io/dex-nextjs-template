import { useMemo, useState } from "react";
import { throttle } from "lodash-es";
import { useResizeObserver, UseResizeObserverOptions } from "./useResizeObserver";

/** The size of the observed element. */
type Size = {
  /** The width of the observed element. */
  width: number | undefined;
  /** The height of the observed element. */
  height: number | undefined;
};

type UseThrottledResizeObserverOptions<T extends HTMLElement = HTMLElement> = Pick<
  UseResizeObserverOptions<T>,
  "ref" | "box"
> & {
  throttleMs?: number;
};

export function useThrottledResizeObserver<T extends HTMLElement = HTMLElement>(
  options: UseThrottledResizeObserverOptions<T>,
): Size {
  const { ref, box, throttleMs = 50 } = options;

  const [size, setSize] = useState<Size>({ width: undefined, height: undefined });

  const onResize = useMemo(
    () => throttle(setSize, throttleMs, { leading: true, trailing: true }),
    [throttleMs, setSize],
  );

  useResizeObserver({ ref, box, onResize });

  return size;
}
