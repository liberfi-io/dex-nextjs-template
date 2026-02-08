/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowDownIcon, ArrowUpIcon } from "@/assets";
import { EmptyData } from "@/components/EmptyData";
import { useTranslation } from "@liberfi/ui-base";
import { Button, Chip, Divider } from "@heroui/react";
import { Token } from "@chainstream-io/sdk";
import clsx from "clsx";
import { useCallback, useState } from "react";

export function TradeTokenCategories({ token }: { token: Token }) {
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(
    token.extension && (token.extension as any).categories
      ? (token.extension as any).categories.length <= 4
      : true,
  );
  const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), [setExpanded]);

  if (!token.extension || !(token.extension as any).categories) {
    return <></>;
  }

  return (
    <section className="w-full">
      <div className="text-sm font-medium text-foreground">{t("extend.trade.about.categories")}</div>

      {(token.extension as any).categories.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2 mt-3">
            {(token.extension as any).categories.map((tag: string, index: number) => (
              <Chip
                key={tag}
                size="sm"
                className={clsx("bg-content3", index >= 4 && !expanded && "hidden")}
              >
                {tag}
              </Chip>
            ))}
          </div>
          {(token.extension as any).categories.length > 4 && (
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
          <Divider className="border-content3" />
        </>
      )}

      {(token.extension as any).categories.length === 0 && <EmptyData />}
    </section>
  );
}
