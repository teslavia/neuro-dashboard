import { cn } from "@/lib/utils";
import type { ConnectionStatus } from "@/lib/types";

const statusConfig: Record<ConnectionStatus, { label: string; className: string }> = {
  online: { label: "在线", className: "bg-emerald-500" },
  offline: { label: "离线", className: "bg-zinc-400" },
  degraded: { label: "异常", className: "bg-amber-500" },
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
      <span className={cn("h-2 w-2 rounded-full", config.className)} />
      {showLabel && <span className="text-xs text-muted-foreground">{config.label}</span>}
    </span>
  );
}
