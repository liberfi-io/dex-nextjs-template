import { PropsWithChildren } from "react";
import { Providers } from "./providers";

export default async function Layout({ children }: PropsWithChildren) {
  return <Providers>{children}</Providers>;
}
