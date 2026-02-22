/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowDownIcon, ArrowUpIcon } from "../../../assets";
import { EmptyData } from "../../EmptyData";
import { useTranslation } from "@liberfi/ui-base";
import { Token } from "@chainstream-io/sdk";
import { Button, Chip, Divider, Image } from "@heroui/react";
import clsx from "clsx";
import { useCallback, useState } from "react";

export function TradeTokenCEXListing({ token }: { token: Token }) {
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(
    token.extension && (token.extension as any).cexs
      ? (token.extension as any).cexs.length <= 4
      : true,
  );
  const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), [setExpanded]);

  if (!token.extension || !(token.extension as any).cexs) {
    return <></>;
  }

  return (
    <section className="w-full">
      <div className="text-sm font-medium text-foreground">{t("extend.trade.about.cex")}</div>

      {(token.extension as any).cexs.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 mt-3">
            {(token.extension as any).cexs.map(
              (cex: { id: string; logo?: string; name: string }, index: number) => (
                <Chip
                  key={cex.id}
                  startContent={cex.logo ? <Image src={cex.logo} width={24} height={24} /> : <></>}
                  className={clsx("bg-content3 text-xs", index >= 4 && !expanded && "hidden")}
                >
                  {cex.name}
                </Chip>
              ),
            )}
          </div>
          {(token.extension as any).cexs.length > 4 && (
            <div className="flex justify-center mt-3">
              <Button
                size="sm"
                className="flex bg-transparent text-xs text-neutral rounded-sm"
                endContent={
                  expanded ? (
                    <ArrowUpIcon width={12} height={12} />
                  ) : (
                    <ArrowDownIcon width={12} height={12} />
                  )
                }
                disableRipple
                onPress={toggleExpanded}
              >
                {expanded ? t("extend.common.show_less") : t("extend.common.show_more")}
              </Button>
            </div>
          )}
        </>
      )}

      {(token.extension as any).cexs.length === 0 && <EmptyData />}

      <Divider className="border-content3" />
    </section>
  );
}
