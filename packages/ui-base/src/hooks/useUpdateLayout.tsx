import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { throttle } from "lodash-es";
import { layoutAtom } from "@/states";

const screenSizes = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/**
 * Automatically calculate the current layout based on the screen size.
 */
export function useUpdateLayout() {
  const setLayout = useSetAtom(layoutAtom);

  useEffect(() => {
    const calcLayout = throttle(() => {
      const width = window.innerWidth;

      if (width >= screenSizes.lg) {
        setLayout("desktop");
      } else if (width >= screenSizes.sm) {
        setLayout("tablet");
      } else {
        setLayout("mobile");
      }
    }, 50);

    calcLayout();

    window.addEventListener("resize", calcLayout);
    return () => {
      window.removeEventListener("resize", calcLayout);
    };
  }, [setLayout]);
}
