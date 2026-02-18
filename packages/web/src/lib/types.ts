// Device connection status
export type ConnectionStatus = "online" | "offline" | "degraded";
export type Severity = "critical" | "warning" | "info";
export type CommandType = "SET_FPS" | "CHANGE_MODEL" | "ENABLE_DEBUG" | "SET_DETECTION_THRESHOLD" | "SHUTDOWN" | "RELOAD_MODEL" | "SWITCH_MODEL_VARIANT";

export interface BoundingBox {
  classId: number;
  className: string;
  confidence: number;
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export interface DeviceMetrics {
  cpuUsage: number;
  npuUsage: number;
  memoryUsedMb: number;
  temperatureC: number;
  fps: number;
}

export interface DetectionResult {
  frameId: number;
  timestampUs: number;
  boxes: BoundingBox[];
  frameData?: string; // base64 JPEG
  metrics: DeviceMetrics;
  traceId: string;
  deviceId: string;
}

export interface Device {
  id: string;
  name: string;
  status: ConnectionStatus;
  firmwareVersion: string;
  capabilities: string[];
  metrics: DeviceMetrics;
  lastSeen: string; // ISO date
}

export interface DetectionEvent {
  id: string;
  deviceId: string;
  deviceName: string;
  type: "DETECTION_ALERT" | "SYSTEM_ERROR" | "MODEL_LOADED" | "HEALTH_UPDATE";
  severity: Severity;
  description: string;
  timestamp: string; // ISO date
  metadata: Record<string, string>;
  boxes?: BoundingBox[];
  frameData?: string; // base64 JPEG
}

export interface SystemStatus {
  edge: {
    connectedDevices: number;
    totalFps: number;
    avgNpuUsage: number;
    avgTemperature: number;
  };
  central: {
    modelLoaded: string;
    inferenceMode: "llm" | "vlm";
    uptime: number;
    vlmQueueDepth: number;
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
}

export interface ControlCommand {
  type: CommandType;
  parameters: Record<string, string>;
  commandId: number;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface DeviceTimeSeries {
  deviceId: string;
  deviceName: string;
  data: TimeSeriesPoint[];
}
