import { RedPacketLayout } from "../../../components/page/RedPacketLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RedPacketLayout>{children}</RedPacketLayout>;
}
