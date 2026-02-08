import clsx from "clsx";
import { LaunchPadTelegramInput } from "../LaunchPadTelegramInput";
import { LaunchPadTwitterInput } from "../LaunchPadTwitterInput";
import { LaunchPadWebsiteInput } from "../LaunchPadWebsiteInput";

export type RaydiumLaunchPadSocialsFormProps = {
  className?: string;
};

export function RaydiumLaunchPadSocialsForm({ className }: RaydiumLaunchPadSocialsFormProps) {
  return (
    <div className={clsx("w-full flex flex-col gap-4 text-sm", className)}>
      <LaunchPadWebsiteInput />
      <LaunchPadTwitterInput />
      <LaunchPadTelegramInput />
    </div>
  );
}
