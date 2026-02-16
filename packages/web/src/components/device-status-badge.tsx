import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/lib/types";

const statusConfig: Record<ConnectionStatus, { label: string; dotClass: string; textClass: string }> = {
  online: { label: "在线", dotClass: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]", textClass: "text-emerald-400" },
  offline: { label: "离线", dotClass: "bg-zinc-500", textClass: "text-zinc-500" },
  degraded: { label: "异常", dotClass: "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]", textClass: "text-amber-400" },
};

interface DeviceStatusBadgeProps {
  status: ConnectionStatus;
  showLabel?: boolean;
  className?: string;
}

export function DeviceStatusBadge({ status, showLabel = true, className }: DeviceStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("h-2 w-2 rounded-full", config.dotClass)} />
      {showLabel && <span className={cn("text-xs font-medium", config.textClass)}>{config.label}</span>}
    </span>
  );
}
