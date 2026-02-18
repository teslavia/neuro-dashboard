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
  Brain,
  AlertTriangle,
  Sparkles,
  Camera,
  Tag,
} from "lucide-react";

const sidebarItems = [
  { href: "/admin/devices", label: "设备管理", icon: Cpu },
  { href: "/admin/models", label: "模型管理", icon: Box },
  { href: "/admin/config", label: "系统配置", icon: Settings },
  { href: "/admin/behavior", label: "行为分析", icon: Brain },
  { href: "/admin/anomaly", label: "异常基线", icon: AlertTriangle },
  { href: "/admin/vlm-guidance", label: "VLM 引导", icon: Sparkles },
  { href: "/admin/reid", label: "跨摄像头追踪", icon: Camera },
  { href: "/admin/annotator", label: "自动标注", icon: Tag },
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
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link href="/monitor" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">N</div>
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
                ? "bg-sidebar-primary/15 text-sidebar-primary font-medium"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
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
