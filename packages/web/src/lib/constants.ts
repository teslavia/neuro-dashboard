export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";
export const PROMETHEUS_URL = process.env.NEXT_PUBLIC_PROMETHEUS_URL || "http://localhost:9090";
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const REFRESH_INTERVALS = {
  status: 5000,
  devices: 10000,
  events: 5000,
  metrics: 15000,
} as const;

export const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-red-500 bg-red-500/10 border-red-500/20",
  warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  info: "text-blue-500 bg-blue-500/10 border-blue-500/20",
};

export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const EVENT_TYPE_LABELS: Record<string, string> = {
  DETECTION_ALERT: "检测告警",
  SYSTEM_ERROR: "系统错误",
  MODEL_LOADED: "模型加载",
  HEALTH_UPDATE: "健康更新",
};
