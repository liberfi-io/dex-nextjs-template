import { forwardRef, PropsWithChildren, useImperativeHandle } from "react";
import { DropzoneOptions, useDropzone } from "react-dropzone";

export type UploaderProps = PropsWithChildren<DropzoneOptions>;

export type UploaderRef = {
  open: () => void;
};

export const Uploader = forwardRef<UploaderRef, UploaderProps>(({ children, ...props }, ref) => {
  const { getRootProps, getInputProps, open } = useDropzone(props);

  useImperativeHandle(
    ref,
    () => ({
      open,
    }),
    [open],
  );

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {children}
    </div>
  );
});
