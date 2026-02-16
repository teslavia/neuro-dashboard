"use client";

import { useState, useMemo } from "react";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api";
import { REFRESH_INTERVALS } from "@/lib/constants";
import type { DetectionEvent, Severity } from "@/lib/types";
import { SeverityBadge } from "@/components/severity-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi-card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, Info, BellOff, Check } from "lucide-react";

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

const SEVERITY_FILTER_OPTIONS: { label: string; value: Severity | "all" }[] = [
  { label: "全部", value: "all" },
  { label: "严重", value: "critical" },
  { label: "警告", value: "warning" },
  { label: "信息", value: "info" },
];

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function AlertsPage() {
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  const [silencedIds, setSilencedIds] = useState<Set<string>>(new Set());

  const { data: events, isLoading } = useApiQuery({
    fetcher: () => api.getEvents({ limit: 100 }),
    refreshInterval: REFRESH_INTERVALS.events,
  });

  const alertCounts = useMemo(() => {
    if (!events) return { critical: 0, warning: 0, info: 0 };
    return {
      critical: events.filter((e) => e.severity === "critical").length,
      warning: events.filter((e) => e.severity === "warning").length,
      info: events.filter((e) => e.severity === "info").length,
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    const filtered =
      severityFilter === "all"
        ? [...events]
        : events.filter((e) => e.severity === severityFilter);
    return filtered.sort(
      (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    );
  }, [events, severityFilter]);

  const handleAcknowledge = (id: string) => {
    setAcknowledgedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleSilence = (id: string) => {
    setSilencedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">告警管理</h1>
          <p className="text-muted-foreground">告警列表、确认/静默、严重级别过滤</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-8 w-16 rounded bg-muted animate-pulse" />
                <div className="mt-2 h-4 w-24 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>告警列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                  <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">告警管理</h1>
        <p className="text-muted-foreground">告警列表、确认/静默、严重级别过滤</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          title="严重告警"
          value={alertCounts.critical}
          icon={AlertTriangle}
          className="border-red-500/20"
        />
        <KpiCard
          title="警告"
          value={alertCounts.warning}
          icon={AlertCircle}
          className="border-amber-500/20"
        />
        <KpiCard
          title="信息"
          value={alertCounts.info}
          icon={Info}
          className="border-blue-500/20"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>告警列表</CardTitle>
          <div className="flex items-center gap-1">
            {SEVERITY_FILTER_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={severityFilter === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSeverityFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              暂无告警
            </p>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map((event) => {
                const isAcked = acknowledgedIds.has(event.id);
                const isSilenced = silencedIds.has(event.id);
                return (
                  <div
                    key={event.id}
                    className={`flex items-center gap-4 rounded-lg border p-3 transition-opacity ${
                      isAcked || isSilenced ? "opacity-50" : ""
                    }`}
                  >
                    <SeverityBadge severity={event.severity} />
                    <span className="shrink-0 text-sm font-mono text-muted-foreground">
                      {formatTime(event.timestamp)}
                    </span>
                    <span className="shrink-0 text-sm font-medium">
                      {event.deviceName}
                    </span>
                    <span className="flex-1 truncate text-sm">
                      {event.description}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isAcked}
                        onClick={() => handleAcknowledge(event.id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                        确认
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSilenced}
                        onClick={() => handleSilence(event.id)}
                      >
                        <BellOff className="h-3.5 w-3.5" />
                        静默
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
