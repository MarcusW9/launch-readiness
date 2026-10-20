import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/launch/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { getSession } from "@/lib/auth";
import { productRepository } from "@/lib/launch/product-repository";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Launch Readiness | Product launch tracking (portfolio prototype)",
  description:
    "Portfolio prototype: track upcoming products, understand launch readiness and identify where action is required. Fictional retailer, synthetic demo data only.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fb" },
    { media: "(prefers-color-scheme: dark)", color: "#14181f" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [products, session] = await Promise.all([productRepository.list(), getSession()]);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppShell initialProducts={products} session={session}>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
