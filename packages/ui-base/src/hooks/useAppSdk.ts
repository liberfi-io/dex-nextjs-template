import { useContext } from "react";
import { AppSdkContext } from "@/providers";

export function useAppSdk() {
  const context = useContext(AppSdkContext);
  if (!context) {
    throw new Error("useAppSdk must be used within an AppSdkProvider");
  }
  return context;
}
