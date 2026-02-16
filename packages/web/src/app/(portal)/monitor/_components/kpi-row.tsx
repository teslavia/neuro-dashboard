"use client";

import { KpiCard } from "@/components/kpi-card";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api";
import { REFRESH_INTERVALS } from "@/lib/constants";
import type { SystemStatus } from "@/lib/types";
import { Cpu, Gauge, Thermometer, AlertTriangle } from "lucide-react";

export function KpiRow() {
  const { data: status } = useApiQuery<SystemStatus>({
    fetcher: api.getStatus,
    refreshInterval: REFRESH_INTERVALS.status,
  });

  if (!status) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="活跃设备"
        value={status.edge.connectedDevices}
        unit="台"
        icon={Cpu}
      />
      <KpiCard
        title="总 FPS"
        value={Math.round(status.edge.totalFps)}
        unit="fps"
        icon={Gauge}
      />
      <KpiCard
        title="平均 NPU"
        value={status.edge.avgNpuUsage.toFixed(1)}
        unit="%"
        icon={Thermometer}
      />
      <KpiCard
        title="告警数"
        value={status.alerts.critical + status.alerts.warning}
        icon={AlertTriangle}
        trend={
          status.alerts.critical > 0
            ? { value: status.alerts.critical, label: "严重" }
            : undefined
        }
      />
    </div>
  );
}
