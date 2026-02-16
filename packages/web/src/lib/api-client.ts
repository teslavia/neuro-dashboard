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
  getStatus: () => fetchJson<SystemStatus>("/api/status"),
  getDevices: () => fetchJson<Device[]>("/api/devices"),
  getEvents: (params?: { limit?: number; device_id?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.device_id) qs.set("device_id", params.device_id);
    const query = qs.toString();
    return fetchJson<DetectionEvent[]>(`/api/events${query ? `?${query}` : ""}`);
  },
  getEventHistory: (hours: number) =>
    fetchJson<DetectionEvent[]>(`/api/events/history?hours=${hours}`),
  getDeviceEvents: (deviceId: string) =>
    fetchJson<DetectionEvent[]>(`/api/devices/${deviceId}/events`),
  sendCommand: (command: ControlCommand) =>
    fetchJson<{ success: boolean; message: string }>("/api/command", {
      method: "POST",
      body: JSON.stringify(command),
    }),
};
