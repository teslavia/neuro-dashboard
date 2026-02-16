"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeviceStatusBadge } from "@/components/device-status-badge";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api";
import { REFRESH_INTERVALS } from "@/lib/constants";
import type { Device } from "@/lib/types";

import { cn } from "@/lib/utils";

const statusBorderColor = {
  online: "border-l-emerald-500",
  offline: "border-l-zinc-500",
  degraded: "border-l-amber-500",
} as const;

export function DeviceGrid() {
  const { data: devices } = useApiQuery<Device[]>({
    fetcher: api.getDevices,
    refreshInterval: REFRESH_INTERVALS.devices,
  });

  if (!devices) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-44 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {devices.map((device) => (
        <Card key={device.id} className={cn("relative border-l-2", statusBorderColor[device.status])}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium truncate">
                {device.name}
              </CardTitle>
              <DeviceStatusBadge status={device.status} showLabel={false} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">FPS</span>
              <span className="font-mono">{Math.round(device.metrics.fps)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">NPU</span>
              <span className="font-mono">{device.metrics.npuUsage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">温度</span>
              <span className="font-mono">{device.metrics.temperatureC.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">内存</span>
              <span className="font-mono">{Math.round(device.metrics.memoryUsedMb)} MB</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
