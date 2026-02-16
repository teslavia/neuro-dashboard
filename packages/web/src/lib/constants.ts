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
  critical: "text-red-400 bg-red-500/15 border-red-500/30",
  warning: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  info: "text-blue-400 bg-blue-500/15 border-blue-500/30",
};

export const CHART_COLORS = [
  "#818cf8",
  "#34d399",
  "#fbbf24",
  "#c084fc",
  "#f87171",
];

export const EVENT_TYPE_LABELS: Record<string, string> = {
  DETECTION_ALERT: "检测告警",
  SYSTEM_ERROR: "系统错误",
  MODEL_LOADED: "模型加载",
  HEALTH_UPDATE: "健康更新",
};
