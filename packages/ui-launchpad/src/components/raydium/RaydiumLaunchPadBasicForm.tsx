import clsx from "clsx";
import { LaunchPadDescriptionInput } from "../LaunchPadDescriptionInput";
import { LaunchPadImageUpload } from "../LaunchPadImageUpload";
import { LaunchPadNameInput } from "../LaunchPadNameInput";
import { LaunchPadTickerInput } from "../LaunchPadTickerInput";

export type RaydiumLaunchPadBasicFormProps = {
  className?: string;
};

export function RaydiumLaunchPadBasicForm({ className }: RaydiumLaunchPadBasicFormProps) {
  return (
    <div className={clsx("w-full flex flex-col gap-4 text-sm", className)}>
      <LaunchPadNameInput />
      <LaunchPadTickerInput />
      <LaunchPadDescriptionInput />
      <LaunchPadImageUpload />
    </div>
  );
}
