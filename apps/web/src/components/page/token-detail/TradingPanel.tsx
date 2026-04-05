import { InstantTrade } from "@liberfi/ui-dex/components/trade";
import { useState } from "react";

function PositionStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1">
      <span className="text-xs font-normal leading-4 text-[rgb(119,122,140)]">{label}</span>
      <div className="flex flex-row items-center gap-1">
        <span className={`text-xs font-medium tabular-nums leading-4 ${color}`}>{value}</span>
      </div>
    </div>
  );
}

export function TradingPanel() {
  const [activePreset, setActivePreset] = useState(0);

  return (
    <div className="relative axiom-trade-panel">
      <div className="relative h-full w-full">
        {/* Trading form */}
        <InstantTrade className="!rounded-none !bg-transparent !py-2 !px-3" />

        {/* Position stats — Axiom: flex-row, each cell flex-1 flex-col centered, gap=4px */}
        <div className="flex w-full flex-row items-center justify-between px-4 py-1">
          <PositionStat label="Bought" value="0" color="text-[rgb(200,201,209)]" />
          <PositionStat label="Sold" value="0" color="text-[rgb(200,201,209)]" />
          <PositionStat label="Holding" value="0" color="text-[rgb(200,201,209)]" />
          <div className="flex flex-1 flex-col items-center justify-center gap-1">
            <span className="text-xs font-normal leading-4 text-[rgb(119,122,140)]">PnL ⓘ</span>
            <span className="text-xs font-medium tabular-nums leading-4 text-bullish">+0 (+0%)</span>
          </div>
        </div>
      </div>

      {/* PRESET tabs — Axiom: h=36px, px=16px, border-t border-b, flex jc=center */}
      <div className="flex h-[36px] w-full flex-row items-center justify-center border-b border-t border-neutral-800 px-4">
        {["PRESET 1", "PRESET 2", "PRESET 3"].map((label, i) => (
          <div
            key={label}
            onClick={() => setActivePreset(i)}
            className={`flex flex-1 cursor-pointer flex-row items-center justify-center rounded h-[24px] ${
              activePreset === i
                ? "bg-[rgba(82,111,255,0.15)] hover:bg-[rgba(82,111,255,0.25)]"
                : "bg-transparent hover:bg-neutral-800/40"
            }`}
          >
            <span className="text-base font-normal text-[rgb(252,252,252)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
