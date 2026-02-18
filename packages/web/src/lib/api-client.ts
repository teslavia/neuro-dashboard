import { API_BASE_URL } from "./constants";
import type { SystemStatus, Device, DetectionEvent, ControlCommand } from "./types";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export const apiClient = {
  getStatus: () => fetchJson<SystemStatus>("/api/v2/status"),
  getDevices: () => fetchJson<Device[]>("/api/v2/devices"),
  getEvents: (params?: { limit?: number; device_id?: string; severity?: string; event_type?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.device_id) qs.set("device_id", params.device_id);
    if (params?.severity) qs.set("severity", params.severity);
    if (params?.event_type) qs.set("event_type", params.event_type);
    const query = qs.toString();
    return fetchJson<DetectionEvent[]>(`/api/v2/events${query ? `?${query}` : ""}`);
  },
  getEventHistory: (hours: number) =>
    fetchJson<{ count: number; hours: number; events: DetectionEvent[] }>(
      `/api/v2/events/history?hours=${hours}`
    ).then((r) => r.events),
  getDeviceEvents: (deviceId: string) =>
    fetchJson<DetectionEvent[]>(`/api/v2/events?device_id=${deviceId}`),
  sendCommand: (command: ControlCommand) =>
    fetchJson<{ success: boolean; message: string }>("/api/v2/command", {
      method: "POST",
      body: JSON.stringify(command),
    }),
};
