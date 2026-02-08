import { defaultTheme } from "@/styles";
import { Toaster } from "react-hot-toast";

export function CustomToaster() {
  return (
    <Toaster
      toastOptions={{
        duration: 5000,
        position: "top-center",
        style: {
          fontSize: "12px",
          color: `${defaultTheme.colors.neutral}`,
          background: `${defaultTheme.colors.content2}`,
          border: `1px solid hsl(var(--heroui-divider)/var(--heroui-divider-opacity,var(--tw-border-opacity)))`,
          padding: "10px 16px",
          borderRadius: "8px",
        },
        success: {
          iconTheme: {
            primary: `${defaultTheme.colors.success}`,
            secondary: `${defaultTheme.colors.content2}`,
          },
        },
        error: {
          iconTheme: {
            primary: `${defaultTheme.colors.danger}`,
            secondary: `${defaultTheme.colors.content2}`,
          },
        },
      }}
    />
  );
}
