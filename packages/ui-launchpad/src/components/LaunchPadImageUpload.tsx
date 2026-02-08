import { useCallback, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import clsx from "clsx";
import { toast } from "react-hot-toast";
import { Button, Image } from "@heroui/react";
import {
  ImageGalleryOutlinedIcon,
  Uploader,
  UploaderRef,
  useTranslation,
  useUpload,
} from "@liberfi/ui-base";

export function LaunchPadImageUpload() {
  const { t } = useTranslation();

  const { control, setValue, resetField } = useFormContext();

  const uploaderRef = useRef<UploaderRef>(null);

  const handleOpenUploader = useCallback(() => uploaderRef.current?.open(), []);

  const upload = useUpload();

  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: File[]) => {
      setUploading(true);
      try {
        const url = await upload(files[0]);
        setValue("image", url, { shouldDirty: true, shouldValidate: true });
      } catch (e) {
        resetField("image", { defaultValue: undefined });
        console.error("upload image error", e);
        if (e instanceof Error && "response" in e && e.response instanceof Response) {
          try {
            const bodyText = await e.response.text();
            const { message, details } = JSON.parse(bodyText ?? "{}") as {
              message?: string;
              details?: string;
            };
            toast.error(details ?? message ?? t("extend.launchpad.error_image_upload"));
            // eslint-disable-next-line unused-imports/no-unused-vars
          } catch (_e) {
            toast.error(t("extend.launchpad.error_image_upload"));
          }
        } else {
          toast.error(t("extend.launchpad.error_image_upload"));
        }
      } finally {
        setUploading(false);
      }
    },
    // setValue should not be included in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [upload],
  );

  return (
    <Controller
      control={control}
      name="image"
      render={({ field: { value, disabled }, fieldState: { invalid, error } }) => (
        <div className="w-full space-y-1.5">
          <h3 className={clsx({ "text-danger": invalid })}>{t("extend.launchpad.image_label")}</h3>
          <Uploader
            ref={uploaderRef}
            accept={{
              "image/jpeg": [".jpg", ".jpeg"],
              "image/png": [".png"],
              "image/gif": [".gif"],
              "image/webp": [".webp"],
            }}
            maxFiles={1}
            maxSize={1024 * 1024 * 10} // 10MB
            noClick
            noKeyboard
            onDropAccepted={handleFiles}
            disabled={disabled}
          >
            <div
              className={clsx(
                "flex flex-col gap-4 items-center",
                "border-dashed border-2",
                invalid ? "border-danger" : "border-border",
                "rounded-lg px-4 py-6",
              )}
            >
              {!value && (
                <ImageGalleryOutlinedIcon width={48} height={48} className="text-neutral" />
              )}
              {!value && <p className="text-neutral text-xs">{t("extend.launchpad.image_placeholder")}</p>}
              {value && <Image src={value} width={100} height={100} radius="md" />}
              <Button
                color="primary"
                size="sm"
                onPress={handleOpenUploader}
                isLoading={uploading}
                disableRipple
              >
                {value ? t("extend.launchpad.image_reupload_action") : t("extend.launchpad.image_upload_action")}
              </Button>
            </div>
          </Uploader>
          {error?.message && <p className="p-1 text-danger text-xs">{t(error.message)}</p>}
          <p className="p-1 text-neutral text-xs">{t("extend.launchpad.image_explained")}</p>
        </div>
      )}
    />
  );
}
