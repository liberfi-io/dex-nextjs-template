import "../../styles/globals.css";
import { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { initServerI18n } from "../../i18n/initServerI18n";
import { detectLanguage } from "../../i18n/detectLanguage";
import { defaultNS } from "@liberfi.io/i18n/server";
import { CONFIG } from "@liberfi/core";
import { GoogleAnalytics } from "../../components/GoogleAnalytics";
import { NewAppLayout } from "../../components/NewAppLayout";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await detectLanguage();
  const i18n = await initServerI18n(locale);
  const t = i18n.getFixedT(locale, defaultNS);
  return {
    applicationName: CONFIG.branding.name,
    title: t("extend.title", { name: CONFIG.branding.name }),
    description: t("extend.description"),
    formatDetection: {
      date: false,
      email: false,
      address: false,
      url: false,
      telephone: false,
    },
    icons: {
      icon: {
        url: "/favicon.ico",
        sizes: "128x128",
        type: "image/x-icon",
      },
    },
  };
}

const inter = Inter({
  subsets: ["latin"],
});

export default async function NewRootLayout({ children }: { children: React.ReactNode }) {
  const locale = await detectLanguage();
  await initServerI18n(locale);
  return (
    <html
      lang={locale}
      className="dark"
      data-theme="liberfi"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className={inter.className}>
        <NewAppLayout locale={locale}>{children}</NewAppLayout>
        {process.env.NODE_ENV === "production" && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
