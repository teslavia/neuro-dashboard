"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDeviceStore } from "@/stores/device-store";
import { Monitor, Calendar, Bell, BarChart3, Menu, X } from "lucide-react";

const navItems = [
  { href: "/monitor", label: "监控大屏", icon: Monitor },
  { href: "/events", label: "事件中心", icon: Calendar },
  { href: "/alerts", label: "告警管理", icon: Bell },
  { href: "/reports", label: "报表统计", icon: BarChart3 },
];

export function PortalNav() {
  const pathname = usePathname();
  const connectionStatus = useDeviceStore((s) => s.connectionStatus);
  const [mobileOpen, setMobileOpen] = useState(false);

  const statusColor = {
    connected: "bg-emerald-500",
    disconnected: "bg-red-500",
    reconnecting: "bg-amber-500",
  }[connectionStatus];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        <Link href="/monitor" className="mr-6 flex items-center gap-2 font-semibold">
          <div className="h-6 w-6 rounded bg-primary" />
          <span className="hidden sm:inline">Neuro Dashboard</span>
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                pathname.startsWith(item.href)
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn("h-2 w-2 rounded-full", statusColor)} />
            <span className="hidden sm:inline">
              {connectionStatus === "connected" ? "已连接" : connectionStatus === "reconnecting" ? "重连中" : "已断开"}
            </span>
          </div>
          <Link
            href="/admin/devices"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            管理后台
          </Link>
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t px-4 py-2 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                pathname.startsWith(item.href)
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
