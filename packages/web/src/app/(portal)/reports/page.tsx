"use client";

import { useMemo } from "react";
import { usePrometheus } from "@/hooks/use-prometheus";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import type { Device, DetectionEvent } from "@/lib/types";
import type { DeviceTimeSeries } from "@/lib/types";

/* ---------- helpers ---------- */

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Merge multiple DeviceTimeSeries into a flat array Recharts can consume.
 *  Each row: { time: "HH:mm", [deviceName]: value, ... }                  */
function mergeTimeSeries(series: DeviceTimeSeries[]): Record<string, string | number>[] {
  if (series.length === 0) return [];
  const base = series[0].data;
  return base.map((point, idx) => {
    const row: Record<string, string | number> = { time: formatTime(point.timestamp) };
    for (const s of series) {
      const v = s.data[idx];
      row[s.deviceName] = v ? Number(v.value.toFixed(2)) : 0;
    }
    return row;
  });
}

const SEVERITY_PIE_COLORS: Record<string, string> = {
  critical: "#f87171",
  warning: "#fbbf24",
  info: "#60a5fa",
};

/* ---------- skeleton ---------- */

function ChartSkeleton() {
  return <div className="h-48 rounded bg-muted animate-pulse" />;
}

/* ---------- page ---------- */

export default function ReportsPage() {
  /* data sources */
  const detections = usePrometheus("np_detections_total");
  const latency = usePrometheus("np_vlm_latency_seconds");
  const { data: devices, isLoading: devicesLoading } = useApiQuery<Device[]>({
    fetcher: api.getDevices,
  });
  const { data: events, isLoading: eventsLoading } = useApiQuery<DetectionEvent[]>({
    fetcher: () => api.getEvents({ limit: 100 }),
  });

  /* derived chart data */
  const detectionChartData = useMemo(() => mergeTimeSeries(detections.data), [detections.data]);
  const detectionDeviceNames = useMemo(() => detections.data.map((s) => s.deviceName), [detections.data]);

  const latencyChartData = useMemo(() => mergeTimeSeries(latency.data), [latency.data]);
  const latencyDeviceNames = useMemo(() => latency.data.map((s) => s.deviceName), [latency.data]);

  const deviceBarData = useMemo(() => {
    if (!devices) return [];
    return devices.map((d) => ({ name: d.name, fps: Number(d.metrics.fps.toFixed(1)) }));
  }, [devices]);

  const severityPieData = useMemo(() => {
    if (!events) return [];
    const counts: Record<string, number> = { critical: 0, warning: 0, info: 0 };
    for (const e of events) {
      if (counts[e.severity] !== undefined) counts[e.severity]++;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [events]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">报表统计</h1>
        <p className="text-muted-foreground">日/周/月检测统计、设备在线率、推理性能趋势</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 1 — 检测趋势 (AreaChart) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">检测趋势</CardTitle>
          </CardHeader>
          <CardContent>
            {detections.isLoading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={detectionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  {detectionDeviceNames.map((name, i) => (
                    <Area
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      fillOpacity={0.3}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 2 — 设备在线率 (BarChart) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">设备在线率</CardTitle>
          </CardHeader>
          <CardContent>
            {devicesLoading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deviceBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="fps" name="FPS">
                    {deviceBarData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 3 — 推理延迟 (LineChart) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">推理延迟</CardTitle>
          </CardHeader>
          <CardContent>
            {latency.isLoading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={latencyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="ms" />
                  <Tooltip />
                  <Legend />
                  {latencyDeviceNames.map((name, i) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 4 — 告警分布 (PieChart) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">告警分布</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Tooltip />
                  <Legend />
                  <Pie
                    data={severityPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {severityPieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={SEVERITY_PIE_COLORS[entry.name] ?? "#8884d8"}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
