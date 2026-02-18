import { API_BASE_URL } from "./constants";
import type {
  SystemStatus,
  Device,
  DetectionEvent,
  ControlCommand,
  ModelRecord,
  ABTestResult,
  ConfigResponse,
  ConfigUpdateResponse,
  ConfigValidationResponse,
  BehaviorEvent,
  AnomalyScore,
  BaselineStats,
  VLMGuidanceResult,
  GeneratedReport,
  ReIDTrack,
  AnnotatedSample,
  User,
} from "./types";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const apiClient = {
  // System status
  getStatus: () => fetchJson<SystemStatus>("/api/v2/status"),

  // Devices
  getDevices: () => fetchJson<Device[]>("/api/v2/devices"),

  // Events
  getEvents: (params?: { limit?: number; device_id?: string; severity?: string; event_type?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.device_id) qs.set("device_id", params.device_id);
    if (params?.severity) qs.set("severity", params.severity);
    if (params?.event_type) qs.set("event_type", params.event_type);
    const query = qs.toString();
    return fetchJson<DetectionEvent[]>(`/api/v2/events${query ? `?${query}` : ""}`);
  },
  postEvent: (event: Partial<DetectionEvent>) =>
    fetchJson<{ ok: boolean }>("/api/v2/events", {
      method: "POST",
      body: JSON.stringify(event),
    }),
  getEventHistory: (hours: number) =>
    fetchJson<{ count: number; hours: number; events: DetectionEvent[] }>(
      `/api/v2/events/history?hours=${hours}`
    ).then((r) => r.events),
  getDeviceEvents: (deviceId: string) =>
    fetchJson<DetectionEvent[]>(`/api/v2/events?device_id=${deviceId}`),

  // Commands
  sendCommand: (command: ControlCommand) =>
    fetchJson<{ success: boolean; message: string }>("/api/v2/command", {
      method: "POST",
      body: JSON.stringify(command),
    }),

  // ── Model Management ──────────────────────────────────────
  getModels: (deviceId?: string) => {
    const qs = deviceId ? `?device_id=${deviceId}` : "";
    return fetchJson<ModelRecord[]>(`/api/v2/models${qs}`);
  },
  switchModel: (modelId: string, deviceId?: string) =>
    fetchJson<{ success: boolean; message: string }>(
      `/api/v2/models/${encodeURIComponent(modelId)}/switch`,
      { method: "POST", body: JSON.stringify({ device_id: deviceId || "edge-001" }) }
    ),
  reloadModels: (deviceId?: string) =>
    fetchJson<{ success: boolean; message: string }>("/api/v2/models/reload", {
      method: "POST",
      body: JSON.stringify({ device_id: deviceId || "edge-001" }),
    }),
  rollbackModel: (modelId: string) =>
    fetchJson<{ success: boolean; message: string }>(
      `/api/v2/models/${encodeURIComponent(modelId)}/rollback`,
      { method: "POST" }
    ),

  // ── A/B Testing ──────────────────────────────────────
  getABTest: () => fetchJson<ABTestResult>("/api/v2/ab-test"),
  setABTestSplit: (trafficSplit: number) =>
    fetchJson<{ success: boolean; traffic_split: number }>("/api/v2/ab-test/split", {
      method: "POST",
      body: JSON.stringify({ traffic_split: trafficSplit }),
    }),
  resetABTest: () =>
    fetchJson<{ success: boolean }>("/api/v2/ab-test/reset", { method: "POST" }),

  // ── Config Management ──────────────────────────────────────
  getConfig: () => fetchJson<ConfigResponse>("/api/v2/config"),
  updateConfig: (config: Record<string, unknown>) =>
    fetchJson<ConfigUpdateResponse>("/api/v2/config", {
      method: "PUT",
      body: JSON.stringify({ config }),
    }),
  validateConfig: (config: Record<string, unknown>) =>
    fetchJson<ConfigValidationResponse>("/api/v2/config/dry-run", {
      method: "POST",
      body: JSON.stringify({ config }),
    }),

  // ── Behavior Analysis (v2) ──────────────────────────────────────
  getBehaviorEvents: (params?: { device_id?: string; behavior_type?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.device_id) qs.set("device_id", params.device_id);
    if (params?.behavior_type) qs.set("behavior_type", params.behavior_type);
    if (params?.limit) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return fetchJson<BehaviorEvent[]>(`/api/v2/behavior/events${query ? `?${query}` : ""}`);
  },

  // ── Anomaly Detection (v2) ──────────────────────────────────────
  getBaselines: () => fetchJson<BaselineStats[]>("/api/v2/anomaly/baselines"),
  getAnomalyScores: (params?: { device_id?: string; hours?: number }) => {
    const qs = new URLSearchParams();
    if (params?.device_id) qs.set("device_id", params.device_id);
    if (params?.hours) qs.set("hours", String(params.hours));
    const query = qs.toString();
    return fetchJson<AnomalyScore[]>(`/api/v2/anomaly/scores${query ? `?${query}` : ""}`);
  },

  // ── VLM Guidance (v2) ──────────────────────────────────────
  getVLMGuidance: (deviceId?: string) => {
    const qs = deviceId ? `?device_id=${deviceId}` : "";
    return fetchJson<VLMGuidanceResult[]>(`/api/v2/vlm/guidance${qs}`);
  },
  applyVLMGuidance: (guidanceId: string) =>
    fetchJson<{ success: boolean }>(
      `/api/v2/vlm/guidance/${encodeURIComponent(guidanceId)}/apply`,
      { method: "POST" }
    ),

  // ── Reports (v2) ──────────────────────────────────────
  generateReport: (params: { start: string; end: string; title?: string }) =>
    fetchJson<GeneratedReport>("/api/v2/reports/generate", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  getReport: (reportId: string) =>
    fetchJson<GeneratedReport>(`/api/v2/reports/${encodeURIComponent(reportId)}`),

  // ── ReID Tracking (v2) ──────────────────────────────────────
  getReIDTracks: (params?: { device_id?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.device_id) qs.set("device_id", params.device_id);
    if (params?.limit) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return fetchJson<ReIDTrack[]>(`/api/v2/reid/tracks${query ? `?${query}` : ""}`);
  },
  getReIDTrack: (trackId: string) =>
    fetchJson<ReIDTrack>(`/api/v2/reid/tracks/${encodeURIComponent(trackId)}`),

  // ── Auto-Annotator (v2) ──────────────────────────────────────
  getAnnotatedSamples: (params?: { verified?: boolean; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.verified !== undefined) qs.set("verified", String(params.verified));
    if (params?.limit) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return fetchJson<AnnotatedSample[]>(`/api/v2/annotator/samples${query ? `?${query}` : ""}`);
  },
  exportAnnotations: (format: "coco" | "yolo") =>
    fetchJson<{ url: string; count: number }>(
      `/api/v2/annotator/export?format=${format}`
    ),

  // ── User Management ──────────────────────────────────────
  getUsers: () => fetchJson<User[]>("/api/v2/users"),
  createUser: (user: { username: string; role: string; email?: string }) =>
    fetchJson<User>("/api/v2/users", { method: "POST", body: JSON.stringify(user) }),
  updateUser: (userId: string, updates: Partial<User>) =>
    fetchJson<User>(`/api/v2/users/${encodeURIComponent(userId)}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),
  deleteUser: (userId: string) =>
    fetchJson<{ success: boolean }>(
      `/api/v2/users/${encodeURIComponent(userId)}`,
      { method: "DELETE" }
    ),
};

// Default export for backward compatibility
export const api = apiClient;
