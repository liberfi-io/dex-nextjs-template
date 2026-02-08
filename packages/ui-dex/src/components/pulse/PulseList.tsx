import { useCallback, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { Virtuoso } from "react-virtuoso";
import { Token } from "@chainstream-io/sdk";
import { useThrottledResizeObserver } from "@liberfi/ui-base";
import { PulseListHeader } from "./PulseListHeader";
import { PulseListItemSkeleton } from "./PulseListItemSkeleton";
import { PulseListItem } from "./PulseListItem";
import { usePulseListContext } from "./PulseListContext";
import { RecursivePartial } from "@liberfi/core";

export type PulseListProps = {
  title: string;
  tokens?: RecursivePartial<Token>[];
  renderTooltip?: (token: RecursivePartial<Token>) => React.ReactNode;
  className?: string;
};

export function PulseList({ title, tokens, renderTooltip, className }: PulseListProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { setLayout, setIsScrolling, setIsPaused } = usePulseListContext();

  const { width } = useThrottledResizeObserver({ ref });

  // use large layout on mobile & tablet
  useEffect(() => {
    setLayout(width && width < 560 ? "narrow" : "wide");
  }, [width, setLayout]);

  const handleListMouseEnter = useCallback(() => setIsPaused(true), [setIsPaused]);

  const handleListMouseLeave = useCallback(() => setIsPaused(false), [setIsPaused]);

  return (
    <div
      ref={ref}
      className={clsx(
        "w-full h-full bg-content1 overflow-hidden flex flex-col border-1 border-border",
        className,
      )}
    >
      <PulseListHeader title={title} className="max-lg:hidden" />
      <div
        className="flex-1 w-full overflow-y-auto"
        onMouseEnter={handleListMouseEnter}
        onMouseLeave={handleListMouseLeave}
      >
        {!tokens && (
          <Virtuoso
            data={Array.from({ length: 10 })}
            itemContent={(index) => <PulseListItemSkeleton isLast={index === 9} />}
          />
        )}
        {tokens && (
          <Virtuoso
            isScrolling={setIsScrolling}
            data={tokens}
            computeItemKey={(_, data) => data.address ?? ""}
            itemContent={(index, data) => (
              <PulseListItem
                token={data}
                isLast={index === tokens.length - 1}
                renderTooltip={renderTooltip}
              />
            )}
          />
        )}
      </div>
    </div>
  );
}
