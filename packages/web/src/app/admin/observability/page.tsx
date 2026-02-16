"use client";

import { usePrometheus } from "@/hooks/use-prometheus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";
import type { DeviceTimeSeries } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Transform DeviceTimeSeries[] into Recharts-friendly flat rows      */
/* ------------------------------------------------------------------ */
function toRechartsData(series: DeviceTimeSeries[]) {
  if (series.length === 0) return { rows: [] as Record<string, string | number>[], deviceNames: [] as string[] };

  const deviceNames = series.map((s) => s.deviceName);

  // Use the first device's timestamps as the base axis
  const base = series[0].data;

  const rows = base.map((point, idx) => {
    const date = new Date(point.timestamp);
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const row: Record<string, string | number> = { time: `${hh}:${mm}` };

    for (const s of series) {
      row[s.deviceName] = s.data[idx]?.value ?? 0;
    }
    return row;
  });

  return { rows, deviceNames };
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */
function ChartSkeleton() {
  return <div className="h-[220px] rounded bg-muted animate-pulse" />;
}

/* ------------------------------------------------------------------ */
/*  Reusable chart card wrappers                                       */
/* ------------------------------------------------------------------ */
function AreaChartCard({ title, query }: { title: string; query: string }) {
  const { data, isLoading } = usePrometheus(query);
  const { rows, deviceNames } = toRechartsData(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              {deviceNames.map((name, i) => (
                <Area
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  fillOpacity={0.2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function LineChartCard({ title, query }: { title: string; query: string }) {
  const { data, isLoading } = usePrometheus(query);
  const { rows, deviceNames } = toRechartsData(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              {deviceNames.map((name, i) => (
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
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function ObservabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">可观测性</h1>
        <p className="text-muted-foreground">
          Prometheus 指标图表、gRPC 调用链、VLM 队列监控
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AreaChartCard title="gRPC 请求量" query="np_grpc_requests_total" />
        <LineChartCard title="VLM 推理延迟" query="np_vlm_latency_seconds" />
        <AreaChartCard title="VLM 队列深度" query="np_vlm_queue_depth" />
        <LineChartCard title="Edge 连接数" query="np_edge_connections" />
      </div>
    </div>
  );
}
