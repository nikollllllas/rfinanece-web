"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CreditCard, Home, PieChart, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-mobile";
import { TransactionCreateDialog } from "./transaction-create-dialog";

const routes = [
  {
    label: "Painel",
    icon: Home,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Transações",
    icon: CreditCard,
    href: "/transactions",
    color: "text-violet-500",
  },
  {
    label: "Orçamentos",
    icon: Wallet,
    href: "/budgets",
    color: "text-pink-700",
  },
  {
    label: "Categorias",
    icon: PieChart,
    href: "/categories",
    color: "text-green-500",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (isMobile) {
      setIsCollapsed(false);
    } else if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (!isMobile) {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(newState));
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "64px" : "256px"
    );
  }, [isCollapsed]);

  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-0 h-screen border-r bg-background z-30 transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6">
            {!isCollapsed && (
              <Link href="/" className="flex items-center gap-2">
                <Wallet className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">Rúbia 💖</span>
              </Link>
            )}
            {isCollapsed && <Wallet className="h-6 w-6 text-primary mx-auto" />}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="ml-auto"
              aria-label={
                isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed ? "rotate-180" : "rotate-0"
                )}
              >
                <path d="m15 6-6 6 6 6" />
              </svg>
            </Button>
          </div>

          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center py-3 px-3 text-sm font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === route.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <route.icon className={cn("h-5 w-5", route.color)} />
                {!isCollapsed && <span className="ml-3">{route.label}</span>}
              </Link>
            ))}
          </div>

          <div className="mt-auto">
            <Button
              className={cn(
                "w-full justify-start",
                isCollapsed && "justify-center px-0"
              )}
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Nova Transação</span>}
            </Button>
          </div>
        </div>
      </div>

      <TransactionCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </>
  );
}
