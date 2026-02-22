import { ListField } from "../../../ListField";
import { Button } from "@heroui/react";
import { ShareIcon } from "../../../../assets";
import { Token, WalletNetWorthItemDTO } from "@chainstream-io/sdk";

export interface ActionsFieldProps {
  className?: string;
  token?: Token;
  balance?: WalletNetWorthItemDTO;
}

export function ActionsField({ className }: ActionsFieldProps) {
  return (
    <ListField shrink className={className}>
      <div className="flex justify-center items-center">
        <Button
          isIconOnly
          className="flex w-5 min-w-5 h-5 min-h-5 bg-transparent text-foreground"
          disableRipple
        >
          <ShareIcon width={18} height={18} />
        </Button>
      </div>
    </ListField>
  );
}
