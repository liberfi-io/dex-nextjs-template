import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { Token } from "@chainstream-io/sdk";
import { tokenInfoAtom } from "@liberfi/ui-dex/states";
import { ChainAddress } from "@liberfi/ui-dex/components/ChainAddress";
import { formatPercentage } from "@liberfi/ui-dex/libs";

export function TokenInfoPanel() {
  const token = useAtomValue(tokenInfoAtom);
  if (!token) return <TokenInfoSkeleton />;
  return <Content token={token} />;
}

function Content({ token }: { token: Token }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const security = (token as any).security as
    | Record<string, unknown>
    | undefined;
  const marketData = token.marketData;

  const topGrid = useMemo(
    () => [
      {
        label: "Top 10 H.",
        value: marketData?.top10HoldingsRatio
          ? formatPercentage(marketData.top10HoldingsRatio)
          : "0%",
        color: ratioColor(marketData?.top10HoldingsRatio),
      },
      {
        label: "Dev H.",
        value: security?.creatorPercentage
          ? formatPercentage(parseFloat(String(security.creatorPercentage)))
          : "0%",
        color: "text-bullish" as const,
      },
      {
        label: "Snipers H.",
        value: "0%",
        color: "text-bullish" as const,
      },
      {
        label: "Insiders",
        value: "0%",
        color: "text-bullish" as const,
      },
      {
        label: "Bundlers",
        value: "0%",
        color: "text-bearish" as const,
      },
      {
        label: "LP Burned",
        value:
          security?.isOpenSource === "1" || security?.lpHolders === "0" ? "100%" : "No",
        color:
          security?.isOpenSource === "1" || security?.lpHolders === "0"
            ? ("text-bullish" as const)
            : ("text-bearish" as const),
      },
    ],
    [security, marketData],
  );

  return (
    <div className="flex flex-col">
      {/* Section header — Axiom: h=36px, pl=8px, pr=16px, pt=4px, jc=space-between */}
      <div className="flex h-[36px] flex-row items-center justify-between gap-4 pl-2 pr-4 pt-1">
        <button className="group flex h-7 w-fit flex-row items-center justify-start rounded pl-2 pr-1 text-sm font-medium text-[rgb(200,201,209)] hover:bg-neutral-800/50 transition-colors">
          Token Info
          <svg className="ml-1 h-3 w-3 text-[rgb(119,122,140)] transition-transform group-hover:rotate-180" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </button>
        <div className="mb-0.5">
          <svg className="h-6 w-6 text-[rgb(119,122,140)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4v5h5M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Content — Axiom: flex-1 flex-col gap=16px p=16px pt=4px */}
      <div className="flex flex-col gap-4 p-4 pt-1">
        {/* Row 1: Top 10 H. / Dev H. / Snipers H. */}
        <div className="flex w-full flex-row gap-4">
          {topGrid.slice(0, 3).map((stat) => (
            <InfoStat key={stat.label} label={stat.label} value={stat.value} color={stat.color} />
          ))}
        </div>

        {/* Row 2: Insiders / Bundlers / LP Burned */}
        <div className="flex w-full flex-row gap-4">
          {topGrid.slice(3, 6).map((stat) => (
            <InfoStat key={stat.label} label={stat.label} value={stat.value} color={stat.color} />
          ))}
        </div>

        {/* Divider — Axiom: h=1px bg=primaryStroke/50 */}
        <div className="h-px w-full bg-neutral-800/50" />

        {/* Row 3: Holders / Pro Traders / Dex Paid */}
        <div className="flex w-full flex-row gap-4">
          <InfoStat
            label="Holders"
            value={marketData?.holders ? String(marketData.holders) : "-"}
            color="text-foreground"
          />
          <InfoStat label="Pro Traders" value="-" color="text-foreground" />
          <InfoStat label="Dex Paid" value="Unpaid" color="text-bearish" />
        </div>

        {/* CA + DA section — Axiom: flex-col gap=16px */}
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-row items-center gap-1">
            <span className="text-sm text-[rgb(119,122,140)]">CA:</span>
            <ChainAddress address={token.address ?? ""} className="text-sm text-[rgb(119,122,140)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <span className={`text-sm font-normal tabular-nums leading-4 ${color}`}>
        {value}
      </span>
      <span className="text-xs leading-4 text-[rgb(119,122,140)]">{label}</span>
    </div>
  );
}

function ratioColor(ratio: number | string | null | undefined): string {
  if (!ratio) return "text-bullish";
  const val = typeof ratio === "string" ? parseFloat(ratio) : ratio;
  return val > 0.3 ? "text-bearish" : "text-bullish";
}

function TokenInfoSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="flex h-[36px] items-center pl-2 pr-4 pt-1">
        <div className="h-4 w-20 bg-content2 rounded animate-pulse" />
      </div>
      <div className="flex flex-col gap-4 p-4 pt-1">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex flex-row gap-4">
            {[...Array(3)].map((__, j) => (
              <div key={j} className="flex-1 h-12 bg-content2 rounded animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
