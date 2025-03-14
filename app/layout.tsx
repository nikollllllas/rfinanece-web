import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import Sidebar from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "RFinances - Personal Finance Management",
  description: "A Notion-like application for financial control and management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Sidebar />
        <div className="pl-[var(--sidebar-width,256px)] transition-all duration-300">
          {children}
        </div>
      </body>
    </html>
  );
}
