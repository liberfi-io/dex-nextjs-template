import { InstantTrade } from "@liberfi/ui-dex/components/trade";

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
  return (
    <div className="relative axiom-trade-panel">
      <div className="relative h-full w-full">
        {/* Trading form (includes preset tabs via SwitchPreset) */}
        <InstantTrade className="!rounded-none !bg-transparent !py-2 !px-3" />

        {/* Position stats */}
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
    </div>
  );
}
