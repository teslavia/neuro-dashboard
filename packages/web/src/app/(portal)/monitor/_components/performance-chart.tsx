"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePrometheus } from "@/hooks/use-prometheus";
import { CHART_COLORS } from "@/lib/constants";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function mergeTimeSeries(
  series: { deviceId: string; deviceName: string; data: { timestamp: string; value: number }[] }[]
) {
  if (series.length === 0) return [];
  const timeMap = new Map<string, Record<string, number>>();

  for (const s of series) {
    for (const point of s.data) {
      const t = point.timestamp;
      if (!timeMap.has(t)) timeMap.set(t, {});
      timeMap.get(t)![s.deviceName] = Math.round(point.value * 100) / 100;
    }
  }

  return Array.from(timeMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timestamp, values]) => ({
      time: new Date(timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      ...values,
    }));
}

export function PerformanceChart() {
  const { data: fpsSeries, isLoading } = usePrometheus("np_edge_fps");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">FPS 趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const chartData = mergeTimeSeries(fpsSeries);
  const deviceNames = fpsSeries.map((s) => s.deviceName);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">FPS 趋势 (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {deviceNames.map((name, idx) => (
              <Area
                key={name}
                type="monotone"
                dataKey={name}
                stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                fillOpacity={0.1}
                strokeWidth={1.5}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
