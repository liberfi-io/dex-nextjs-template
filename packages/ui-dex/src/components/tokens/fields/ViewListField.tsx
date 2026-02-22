import { Button } from "@heroui/react";
import { ViewListOutlinedIcon } from "../../../assets";
import { ListField } from "../../ListField";
import clsx from "clsx";
import { Token } from "@chainstream-io/sdk";

export interface ViewListFieldProps {
  token: Token;
  isViewed: boolean;
  onAction?: () => void;
  className?: string;
}

export function ViewListField({ isViewed, onAction, className }: ViewListFieldProps) {
  return (
    <ListField width={44} grow={false} className={className}>
      <div className="flex items-center justify-center">
        <Button
          isIconOnly
          className={clsx("flex w-8 h-8 min-w-0 min-h-0 rounded-full bg-transparent")}
          disableRipple
          onPress={onAction}
        >
          <ViewListOutlinedIcon
            width={20}
            height={20}
            className={clsx(isViewed ? "text-bullish" : "text-neutral")}
          />
        </Button>
      </div>
    </ListField>
  );
}
