import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import { RouteGuard } from "@/components/auth/route-guard";
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
          <RouteGuard>{children}</RouteGuard>
        </Providers>
      </body>
    </html>
  );
}
