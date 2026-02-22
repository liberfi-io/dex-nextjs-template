import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Checkbox, Input } from "@heroui/react";
import { useTranslation } from "@liberfi/ui-base";
import { TwitterIcon } from "@liberfi/ui-dex/assets/icons";

export function RedPacketCreateOptions() {
  const { control } = useFormContext();

  const { t } = useTranslation();

  const isFollowTwitter = useWatch({ control, name: "options.followTwitter" });

  return (
    <div className="w-full flex flex-col gap-2">
      {/* new user */}
      <Controller
        control={control}
        name="options.newUser"
        render={({ field: { name, onChange, value, onBlur, ref, disabled } }) => (
          <Checkbox
            ref={ref}
            name={name}
            size="sm"
            isSelected={value}
            onValueChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            classNames={{
              label: "text-neutral",
            }}
          >
            {t("extend.redpacket.create.options.new_users")}
          </Checkbox>
        )}
      />

      {/* follow twitter */}
      <Controller
        control={control}
        name="options.followTwitter"
        render={({ field: { name, onChange, value, onBlur, ref, disabled } }) => (
          <Checkbox
            ref={ref}
            name={name}
            size="sm"
            isSelected={value}
            onValueChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            classNames={{
              label: "text-neutral",
            }}
          >
            <span className="inline-flex items-center gap-1">
              {t("extend.redpacket.create.options.follow_social_media").split("%social_media%")[0] ?? ""}
              <TwitterIcon />
              {t("extend.redpacket.create.options.follow_social_media").split("%social_media%")[1] ?? ""}
            </span>
          </Checkbox>
        )}
      />

      {/* twitter username */}
      {isFollowTwitter && (
        <Controller
          control={control}
          name="options.twitterUsername"
          rules={{
            required: t("extend.redpacket.create.options.twitter_username_error_required"),
            minLength: {
              value: 4,
              message: t("extend.redpacket.create.options.twitter_username_error_length"),
            },
            maxLength: {
              value: 15,
              message: t("extend.redpacket.create.options.twitter_username_error_length"),
            },
          }}
          render={({
            field: { name, onChange, value, onBlur, ref, disabled },
            fieldState: { invalid, error },
          }) => (
            <Input
              ref={ref}
              name={name}
              size="sm"
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              isInvalid={invalid}
              errorMessage={error?.message}
              placeholder={t("extend.redpacket.create.options.twitter_username_placeholder")}
              classNames={{
                mainWrapper: "gap-1",
                inputWrapper:
                  "rounded-lg bg-content1 data-[hover=true]:bg-content2 group-data-[focus=true]:bg-content2",
                input: "text-xs caret-primary placeholder:text-placeholder placeholder:text-xs",
              }}
              startContent={"@"}
            />
          )}
        />
      )}
    </div>
  );
}
