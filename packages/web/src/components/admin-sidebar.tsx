"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Monitor,
  Cpu,
  Box,
  Settings,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const sidebarItems = [
  { href: "/admin/devices", label: "设备管理", icon: Cpu },
  { href: "/admin/models", label: "模型管理", icon: Box },
  { href: "/admin/config", label: "系统配置", icon: Settings },
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/observability", label: "可观测性", icon: Activity },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/monitor" className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-sidebar-primary" />
          {!collapsed && (
            <span className="text-sm font-semibold text-sidebar-foreground">管理后台</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              pathname.startsWith(item.href)
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="border-t p-2">
        <Link
          href="/monitor"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
        >
          <Monitor className="h-4 w-4 shrink-0" />
          {!collapsed && <span>返回前台</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>收起</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
