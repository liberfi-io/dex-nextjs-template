import { ChainFilter, ChainFilterMobile, useTokenListContext } from "../tokens";
import { CHAIN_ID } from "@liberfi/core";
import { Button } from "@heroui/react";
import clsx from "clsx";
import { ChainImage, NetworkIcon } from "../../assets";
import { useAtomValue } from "jotai";
import { layoutAtom } from "@liberfi/ui-base";

export function SearchChainSelect() {
  const layout = useAtomValue(layoutAtom);

  const { chainId } = useTokenListContext();

  return (
    <>
      {layout === "desktop" && (
        <ChainFilter
          trigger={
            <Button
              isIconOnly
              className={clsx(
                "flex w-8 min-w-0 h-8 min-h-0 rounded-lg bg-content1 text-foreground",
              )}
              disableRipple
            >
              {chainId ? (
                <ChainImage chainId={chainId as CHAIN_ID} width={18} height={18} />
              ) : (
                <NetworkIcon
                  className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2"
                  width={16}
                  height={16}
                />
              )}
            </Button>
          }
        />
      )}

      {layout !== "desktop" && (
        <ChainFilterMobile
          classNames={{ trigger: "w-8 min-w-0 h-8 min-h-0 rounded-lg bg-content1 text-foreground" }}
        />
      )}
    </>
  );
}
