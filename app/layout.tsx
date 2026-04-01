import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import AppShell from "@/components/app-shell";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { QueryProvider } from "@/components/query-provider";
import { KubbProvider } from "@/components/kubb-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "RFinance - Controle financeiro",
  description: "Controle financeiro da Rúbia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <KubbProvider>
            <AppShell>
              {children}
              <Toaster />
              <Analytics />
            </AppShell>
          </KubbProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
