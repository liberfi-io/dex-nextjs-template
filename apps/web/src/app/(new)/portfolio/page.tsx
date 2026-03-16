import { PortfolioAuthGuard } from "../../../components/PortfolioAuthGuard";
import { PortfolioPage } from "../../../components/page/PortfolioPage";

export default function Page() {
  return (
    <PortfolioAuthGuard>
      <PortfolioPage />
    </PortfolioAuthGuard>
  );
}
