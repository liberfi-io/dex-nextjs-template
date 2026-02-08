import { Button } from "@heroui/react";
import clsx from "clsx";
import { useTranslation } from "@liberfi/ui-base";
import { useTokenListContext } from "../TokenListContext";

export const TIMEFRAMES = ["1m", "5m", "1h", "4h", "24h"];

export function TimeframeFilter() {
  const { t } = useTranslation();
  const { setTimeframe, timeframe } = useTokenListContext();

  return (
    <div className="flex items-center">
      {TIMEFRAMES.map((tf) => (
        <Button
          key={tf}
          className={clsx(
            "flex px-1.5 min-h-0 min-w-12 w-auto h-7 text-xs rounded-2xl text-neutral bg-transparent shrink-0",
            timeframe === tf && "bg-content1 text-foreground",
          )}
          onPress={() => setTimeframe(tf)}
          disableRipple
        >
          {t(`extend.token_list.filters.timeframe.${tf}`)}
        </Button>
      ))}
    </div>
  );
}
