import { PropsWithChildren } from "react";

export type TradeMainSplitRightProps = PropsWithChildren<{
  sideContent?: React.ReactNode;
}>;

export function TradeMainSplitRight({ sideContent, children }: TradeMainSplitRightProps) {
  return (
    <div className="md:flex-1 w-full flex gap-1 md:overflow-hidden">
      <div className="flex-1 md:h-full flex flex-col gap-1 md:overflow-hidden">{children}</div>
      <div className="flex-none w-[300px] md:h-full hidden xl:flex flex-col gap-1 md:overflow-hidden">
        {sideContent}
      </div>
    </div>
  );
}
