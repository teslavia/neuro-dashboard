"use client";

import { useState, useMemo } from "react";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api";
import { REFRESH_INTERVALS, EVENT_TYPE_LABELS } from "@/lib/constants";
import type { DetectionEvent, Severity, Device } from "@/lib/types";
import { SeverityBadge } from "@/components/severity-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EVENT_TYPES = ["DETECTION_ALERT", "SYSTEM_ERROR", "MODEL_LOADED", "HEALTH_UPDATE"] as const;
const SEVERITIES: Severity[] = ["critical", "warning", "info"];

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

export default function EventsPage() {
  const [deviceFilter, setDeviceFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const { data: events, isLoading: eventsLoading } = useApiQuery<DetectionEvent[]>({
    fetcher: () => api.getEvents({ limit: 100 }),
    refreshInterval: REFRESH_INTERVALS.events,
  });

  const { data: devices } = useApiQuery<Device[]>({
    fetcher: api.getDevices,
  });

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((e) => {
      if (deviceFilter && e.deviceId !== deviceFilter) return false;
      if (severityFilter && e.severity !== severityFilter) return false;
      if (typeFilter && e.type !== typeFilter) return false;
      return true;
    });
  }, [events, deviceFilter, severityFilter, typeFilter]);

  const selectClass =
    "h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">事件中心</h1>
        <p className="text-muted-foreground">检测事件时间线，按设备/类别/置信度筛选</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <select
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">全部设备</option>
          {devices?.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">全部级别</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s === "critical" ? "严重" : s === "warning" ? "警告" : "信息"}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">全部类型</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>事件列表</CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                  <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">暂无事件</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[80px_120px_100px_80px_1fr] gap-3 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                <span>时间</span>
                <span>设备</span>
                <span>类型</span>
                <span>级别</span>
                <span>描述</span>
              </div>
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="grid grid-cols-[80px_120px_100px_80px_1fr] gap-3 items-center px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors text-sm"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatTime(event.timestamp)}
                  </span>
                  <span className="truncate">{event.deviceName}</span>
                  <span className="text-xs">{EVENT_TYPE_LABELS[event.type]}</span>
                  <SeverityBadge severity={event.severity} />
                  <span className="truncate text-muted-foreground">{event.description}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
