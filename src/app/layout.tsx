import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import { RouteGuard } from "@/components/auth/route-guard";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "CADPRO TMMS",
  description: "CADPRO TMMS frontend",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          <RouteGuard>
            <AppShell>{children}</AppShell>
          </RouteGuard>
        </Providers>
      </body>
    </html>
  );
}
