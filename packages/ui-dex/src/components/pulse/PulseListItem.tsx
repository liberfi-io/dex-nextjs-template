import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { clsx } from "clsx";
import { Tooltip } from "@heroui/react";
import { Token } from "@chainstream-io/sdk";
import { RecursivePartial, ROUTES } from "@liberfi/core";
import { useRouter } from "@liberfi/ui-base";
import { PulseAvatar } from "./PulseAvatar";
import { PulseTokenTitle } from "./PulseTokenTitle";
import { PulseTokenLinks } from "./PulseTokenLinks";
import { PulseTokenCreatedAt } from "./PulseTokenCreatedAt";
import { PulseTokenHolders } from "./PulseTokenHolders";
import { PulseTokenHoldingRatios } from "./PulseTokenHoldingRatios";
import { PulseTokenMarketCap } from "./PulseTokenMarketCap";
import { usePulseListContext } from "./PulseListContext";

export type PulseListItemProps = {
  token: RecursivePartial<Token>;
  renderTooltip?: (token: RecursivePartial<Token>) => React.ReactNode;
  isLast?: boolean;
  className?: string;
};

export function PulseListItem({
  token,
  renderTooltip,
  isLast = false,
  className,
}: PulseListItemProps) {
  const { navigate } = useRouter();

  const handleNavigate = useCallback(
    () => navigate(ROUTES.trade.token(token.chain ?? "", token.address ?? "")),
    [navigate, token.chain, token.address],
  );

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);

  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  const { layout, isScrolling } = usePulseListContext();

  const isTooltipOpen = useMemo(() => !isScrolling && isHovered, [isScrolling, isHovered]);

  const tooltipContent = useMemo(() => renderTooltip?.(token), [renderTooltip, token]);

  return (
    <PulseListItemTooltipWrapper isOpen={isTooltipOpen} content={tooltipContent}>
      <div
        className={clsx(
          "w-full px-3 pt-3 py-1 overflow-hidden hover:bg-content2 flex flex-col gap-2 group cursor-pointer",
          layout === "narrow" ? "h-[152px]" : "h-[124px]",
          !isLast && "border-b border-border",
          className,
        )}
        data-layout={layout}
        onClick={handleNavigate}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative flex justify-between gap-3">
          {/* left: token avatar */}
          <div className="flex-none">
            <PulseAvatar token={token} />
          </div>
          {/* center: token infos */}
          <div className="flex-1 flex flex-col justify-between gap-3 overflow-hidden">
            {/* center top */}
            <div className="w-full flex flex-col gap-1.5">
              <PulseTokenTitle token={token} />
              <div className="flex items-center gap-3">
                <PulseTokenCreatedAt token={token} />
                <PulseTokenLinks token={token} />
                <PulseTokenHolders token={token} className="group-data-[layout=narrow]:hidden" />
              </div>
            </div>
            {/* center bottom */}
            <div className="w-full flex flex-col gap-1.5">
              <PulseTokenHolders token={token} className="group-data-[layout=wide]:hidden" />
              <PulseTokenHoldingRatios
                token={token}
                className="group-data-[layout=narrow]:hidden"
              />
            </div>
          </div>

          {/* right: token market cap */}
          <PulseTokenMarketCap token={token} />
        </div>

        <PulseTokenHoldingRatios token={token} className="group-data-[layout=wide]:hidden" />
      </div>
    </PulseListItemTooltipWrapper>
  );
}

function PulseListItemTooltipWrapper({
  isOpen,
  content,
  children,
}: PropsWithChildren<{ isOpen: boolean; content: React.ReactNode }>) {
  return content ? (
    <Tooltip content={content} isOpen={isOpen} closeDelay={0} classNames={{ content: "py-2 px-4" }}>
      {children}
    </Tooltip>
  ) : (
    children
  );
}
