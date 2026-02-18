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

// ── Model Management Types ──────────────────────────────────────

export type ModelStatus = "pending" | "deployed" | "failed" | "undeployed";

export interface ModelRecord {
  modelId: string;
  modelPath: string;
  modelType: string;
  version: string;
  status: ModelStatus;
  npuCore: number;
  deployedAt: number;
  targetDeviceId: string;
  metadata: Record<string, string | number>;
}

export interface VariantMetrics {
  total_inferences: number;
  avg_latency_ms: number;
  accuracy: number;
  total_detections: number;
}

export interface ABTestResult {
  enabled: boolean;
  message?: string;
  winner: string;
  confidence: number;
  sufficient_samples: boolean;
  variants: Record<string, VariantMetrics>;
}

// ── Config Types ──────────────────────────────────────

export interface ConfigResponse {
  path: string;
  config: Record<string, unknown>;
  lastModified: number;
}

export interface ConfigUpdateResponse {
  success: boolean;
  message?: string;
  errors?: string[];
  backupPath?: string;
}

export interface ConfigValidationResponse {
  valid: boolean;
  errors: string[];
}

// ── Behavior & Anomaly Types (v2) ──────────────────────────────────────

export type BehaviorType =
  | "LOITERING"
  | "RUNNING"
  | "CROWD"
  | "FALL"
  | "INTRUSION"
  | "ABANDONED_OBJECT";

export interface BehaviorEvent {
  id: string;
  deviceId: string;
  behaviorType: BehaviorType;
  confidence: number;
  timestamp: string;
  trackId: string;
  boundingBox: BoundingBox;
  metadata: Record<string, string | number>;
}

export interface BaselineStats {
  metricName: string;
  mean: number;
  stdDev: number;
  sampleCount: number;
  lastUpdated: string;
}

export interface AnomalyScore {
  id: string;
  deviceId: string;
  metricName: string;
  zScore: number;
  isAnomaly: boolean;
  timestamp: string;
  value: number;
}

// ── VLM Guidance Types (v2) ──────────────────────────────────────

export interface ConfigAdjustment {
  parameter: string;
  currentValue: string | number;
  suggestedValue: string | number;
  reason: string;
  impact: "low" | "medium" | "high";
}

export interface VLMGuidanceResult {
  id: string;
  deviceId: string;
  timestamp: string;
  analysis: string;
  adjustments: ConfigAdjustment[];
  applied: boolean;
}

// ── Report Types (v2) ──────────────────────────────────────

export interface ReportSection {
  title: string;
  content: string;
  charts?: { type: string; data: unknown }[];
}

export interface GeneratedReport {
  id: string;
  title: string;
  generatedAt: string;
  period: { start: string; end: string };
  sections: ReportSection[];
}

// ── ReID Types (v2) ──────────────────────────────────────

export interface ReIDAppearance {
  deviceId: string;
  timestamp: string;
  boundingBox: BoundingBox;
  confidence: number;
}

export interface ReIDTrack {
  trackId: string;
  globalId: string;
  appearances: ReIDAppearance[];
  firstSeen: string;
  lastSeen: string;
  totalDuration: number;
}

// ── Auto-Annotator Types (v2) ──────────────────────────────────────

export interface AnnotatedSample {
  id: string;
  imageUrl: string;
  annotations: BoundingBox[];
  sourceDevice: string;
  capturedAt: string;
  verified: boolean;
}

// ── User Types ──────────────────────────────────────

export type UserRole = "admin" | "operator" | "viewer";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  email?: string;
  createdAt: string;
  lastLogin?: string;
}
