import { ReactNode, useEffect, useState } from "react";
import toast, { CheckmarkIcon, ErrorIcon, ToastType } from "react-hot-toast";
import { defaultTheme } from "@/styles";
import { useSafeLayoutEffect } from "@/hooks";

export type TimerToastProps = {
  id?: string;
  type?: ToastType;
  duration?: number;
  message: ReactNode;
  startContent?: ReactNode;
  endContent?: ReactNode;
  progress?: boolean;
};

export function TimerToast({
  id,
  type,
  duration = 5000,
  message,
  startContent,
  endContent,
  progress,
}: TimerToastProps) {
  // force dismiss, fix some problems on mobile device
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.dismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, id]);

  // reset progress when duration or message changes
  const [progressStyle, setProgressStyle] = useState<React.CSSProperties>({});
  useSafeLayoutEffect(() => {
    if (progress) {
      setProgressStyle({ transform: "scaleX(0)" });
      setTimeout(() => {
        setProgressStyle({ animation: `toast-progress ${duration}ms linear` });
      });
    }
  }, [message, progress, duration]);

  return (
    <div className="relative bg-content2 rounded-lg px-4 py-2.5 border-1 border-divider text-xs text-neutral overflow-hidden">
      {progress && (
        <div className="absolute inset-0 bg-content3 origin-left" style={progressStyle} />
      )}
      <div className="relative flex items-center gap-2">
        {type === "success" && (
          <CheckmarkIcon
            primary={defaultTheme.colors.success}
            secondary={defaultTheme.colors.content2}
          />
        )}
        {type === "error" && (
          <ErrorIcon
            primary={defaultTheme.colors.danger}
            secondary={defaultTheme.colors.content2}
          />
        )}

        {startContent}

        {message}

        {endContent}
      </div>
    </div>
  );
}
