import { ChainImage, CopyIcon } from "../assets";
import { Chain } from "@liberfi/core";
import { formatShortAddress } from "../libs";
import clsx from "clsx";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard";

type ChainAddressProps = {
  address: string;
  chainId?: Chain;
  showIcon?: boolean;
  className?: string;
};

export function ChainAddress({ address, chainId, showIcon = false, className }: ChainAddressProps) {
  const copy = useCopyToClipboard();

  return (
    <div
      className={clsx("flex items-center gap-1 text-xs", className)}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        copy(address);
      }}
    >
      {showIcon && chainId && <ChainImage chainId={chainId} width={16} height={16} />}
      <div className="cursor-pointer">
        <span className="underline">{formatShortAddress(address)}</span>
      </div>
      <div className="cursor-pointer hover:opacity-75 flex items-center">
        <CopyIcon width={13} height={13} />
      </div>
    </div>
  );
}
