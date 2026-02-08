import { TokenAvatar } from "@/components/TokenAvatar";
import { ListField } from "@/components/ListField";
import clsx from "clsx";
import { Token } from "@chainstream-io/sdk";

export interface TokenFieldProps {
  className?: string;
  token: Token;
}

export function TokenField({ className, token }: TokenFieldProps) {
  return (
    <ListField width={160} className={className}>
      <div className="ml-2.5 flex items-center gap-2">
        <div className="inline-block shrink-0">
          <TokenAvatar src={token.imageUrl ?? ""} name={token.symbol} />
        </div>
        <span
          className={clsx(
            "max-w-[72px] font-medium text-foreground",
            "overflow-hidden truncate text-ellipsis whitespace-nowrap",
          )}
        >
          {token.symbol}
        </span>
      </div>
    </ListField>
  );
}
