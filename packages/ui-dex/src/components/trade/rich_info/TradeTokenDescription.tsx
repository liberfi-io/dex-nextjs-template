import { ArrowDownIcon, ArrowUpIcon } from "@/assets";
import { useTranslation } from "@liberfi/ui-base";
import { Token } from "@chainstream-io/sdk";
import { Button, Divider } from "@heroui/react";
import { useCallback, useState } from "react";

export function TradeTokenDescription({ token }: { token: Token }) {
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(
    token.description ? token.description.length <= 100 : true,
  );
  const toggleExpanded = useCallback(() => setExpanded((prev) => !prev), [setExpanded]);

  return token.description ? (
    <div>
      <section className="text-base font-medium max-lg:hidden">{t("extend.trade.about.info")}</section>
      <p
        className="line-clamp-3 text-xs leading-5 text-neutral data-[expanded=true]:line-clamp-none"
        data-expanded={expanded}
      >
        {token.description}
      </p>
      {token.description.length > 100 && (
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
    </div>
  ) : (
    <></>
  );
}
