import { PortfolioAuthGuard } from "../../../components/page/PortfolioAuthGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortfolioAuthGuard>{children}</PortfolioAuthGuard>;
}
