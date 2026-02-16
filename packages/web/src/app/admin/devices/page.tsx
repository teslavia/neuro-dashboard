"use client";

import { useCallback } from "react";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api";
import { REFRESH_INTERVALS } from "@/lib/constants";
import type { Device, CommandType } from "@/lib/types";
import { DeviceStatusBadge } from "@/components/device-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Power, RotateCcw } from "lucide-react";

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} 秒前`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

let commandSeq = 0;

export default function DevicesPage() {
  const { data: devices, isLoading, refetch } = useApiQuery<Device[]>({
    fetcher: api.getDevices,
    refreshInterval: REFRESH_INTERVALS.devices,
  });

  const handleCommand = useCallback(async (deviceId: string, type: CommandType) => {
    try {
      await api.sendCommand({
        type,
        parameters: { device_id: deviceId },
        commandId: ++commandSeq,
      });
    } catch {
      // TODO: surface error via toast
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">设备管理</h1>
          <p className="text-muted-foreground">设备列表、在线状态、固件版本、远程控制</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="size-4" />
          刷新
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>设备列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
                  <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                  <div className="ml-auto h-4 w-24 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>设备列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">设备名称</th>
                    <th className="pb-3 pr-4 font-medium">状态</th>
                    <th className="pb-3 pr-4 font-medium text-right">FPS</th>
                    <th className="pb-3 pr-4 font-medium text-right">NPU%</th>
                    <th className="pb-3 pr-4 font-medium text-right">温度</th>
                    <th className="pb-3 pr-4 font-medium">固件版本</th>
                    <th className="pb-3 pr-4 font-medium">最后在线</th>
                    <th className="pb-3 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {devices && devices.length > 0 ? (
                    devices.map((device) => (
                      <tr key={device.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 pr-4 font-medium">{device.name}</td>
                        <td className="py-3 pr-4">
                          <DeviceStatusBadge status={device.status} />
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {device.metrics.fps.toFixed(1)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {device.metrics.npuUsage.toFixed(1)}%
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {device.metrics.temperatureC.toFixed(1)}°C
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {device.firmwareVersion}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {formatRelativeTime(device.lastSeen)}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              title="重载模型"
                              onClick={() => handleCommand(device.id, "RELOAD_MODEL")}
                            >
                              <RotateCcw />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="text-destructive hover:text-destructive"
                              title="关机"
                              onClick={() => handleCommand(device.id, "SHUTDOWN")}
                            >
                              <Power />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        暂无设备数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
