import { PropsWithChildren } from "react";
import { AuthGuard } from "@/components/AuthGuard";

export default async function Layout({ children }: PropsWithChildren) {
  return <AuthGuard>{children}</AuthGuard>;
}
