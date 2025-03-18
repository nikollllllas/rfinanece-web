import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import Sidebar from "@/components/sidebar";
import { CategoriesProvider } from "@/components/categories-provider";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

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
        <CategoriesProvider>
          <Sidebar />
          <div className="pl-[var(--sidebar-width,256px)] transition-all duration-300">
            {children}
          </div>
          <Toaster />
          <Analytics />
        </CategoriesProvider>
      </body>
    </html>
  );
}
