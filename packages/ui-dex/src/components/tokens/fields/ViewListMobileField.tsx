import { Button } from "@heroui/react";
import { ViewListOutlinedIcon } from "@/assets";
import { ViewListFieldProps } from "./ViewListField";
import { ListField } from "@/components/ListField";
import clsx from "clsx";

export function ViewListMobileField({ isViewed, onAction, className }: ViewListFieldProps) {
  return (
    <ListField width={32} grow={false} className={className}>
      <div className="flex items-center justify-center">
        <Button
          isIconOnly
          className={clsx("flex w-5 h-5 min-w-0 min-h-0 rounded-full bg-transparent")}
          disableRipple
          onPress={onAction}
        >
          <ViewListOutlinedIcon
            width={18}
            height={18}
            className={clsx(isViewed ? "text-bullish" : "text-neutral")}
          />
        </Button>
      </div>
    </ListField>
  );
}
