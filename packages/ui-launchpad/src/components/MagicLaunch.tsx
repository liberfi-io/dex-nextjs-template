import { Button, Textarea } from "@heroui/react";
import {
  useTranslation,
  useAuthenticatedCallback,
  QuestionMarkOutlinedIcon,
} from "@liberfi/ui-base";
import { useGenerateTweetMediaMemeMutation } from "@liberfi.io/ui-media-track";
import clsx from "clsx";
import { useState } from "react";
import { GeneratedMemeInfo } from "@liberfi.io/types";
import { StyledTooltip } from "@liberfi.io/ui";

export type MagicLaunchProps = {
  prompt?: string;
  onGenerate?: (result: GeneratedMemeInfo) => void;
};

export function MagicLaunch({ prompt = "", onGenerate }: MagicLaunchProps) {
  const { t } = useTranslation();

  const [value, setValue] = useState(prompt);

  const { mutateAsync: generateAsync, isPending: isGenerating } =
    useGenerateTweetMediaMemeMutation();

  const handleGenerate = useAuthenticatedCallback(async () => {
    if (value.length > 0 && value.length <= 300) {
      // TODO
      const result = await generateAsync({
        id: new Date().getTime().toString(),
        type: "tweet",
        tweet: {
          type: "tweet",
          tweetId: new Date().getTime().toString(),
          user: {
            username: "MagicLaunch",
          },
          content: {
            text: value,
          },
          timestamp: new Date().getTime(),
        },
      });
      onGenerate?.(result);
    }
  }, [value, generateAsync, onGenerate]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span
            className="font-semibold text-sm"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgb(199, 255, 46) 0%, rgb(247, 104, 22) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("extend.launchpad.magic_launch")}
          </span>
          <StyledTooltip content={t("extend.launchpad.magic_launch_explained")} closeDelay={0}>
            <QuestionMarkOutlinedIcon width={12} height={12} className="text-neutral" />
          </StyledTooltip>
        </div>
        <div className="flex items-center justify-end gap-px text-xs">
          <span className={clsx(value.length > 300 ? "text-danger" : "text-foreground")}>
            {value.length}
          </span>
          <span>/</span>
          <span className="text-neutral">{300}</span>
        </div>
      </div>

      <div className="relative">
        <div
          className="absolute inset-0 rounded-md p-px"
          style={{
            background:
              "conic-gradient(from 90deg at 48.26% 50%, rgb(199, 255, 46) 51.3623deg, rgb(227, 164, 31) 158.169deg, rgb(247, 104, 22) 189.736deg, rgb(227, 164, 31) 224.002deg, rgb(199, 255, 46) 335.692deg, rgb(227, 164, 31) 358.313deg)",
          }}
        >
          <div className="bg-content2 rounded-md h-full w-full"></div>
        </div>
        <div className="relative rounded-lg p-2">
          <div
            className={clsx(
              "flex",
              value.length > 0 && "flex-col items-end",
              !value && "flex-row items-center gap-2",
            )}
          >
            <Textarea
              value={value}
              onValueChange={setValue}
              minRows={1}
              maxRows={3}
              placeholder={t("extend.launchpad.magic_launch_placeholder")}
              classNames={{
                inputWrapper:
                  "bg-content2 data-[hover=true]:bg-content2 group-data-[focus=true]:bg-content2",
              }}
            />
            <div className="flex justify-end items-end">
              <Button
                color="primary"
                size="sm"
                radius="md"
                isLoading={isGenerating}
                disabled={value.length === 0 || value.length > 300}
                className={clsx((value.length === 0 || value.length > 300) && "cursor-not-allowed")}
                style={{
                  background:
                    "linear-gradient(90deg, rgb(199, 255, 46) 0%, rgb(247, 104, 22) 100%)",
                }}
                onPress={handleGenerate}
              >
                {t("extend.launchpad.magic_launch_submit")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
