import { USE_MOCK } from "./constants";
import { apiClient } from "./api-client";
import { mockDevices, mockEvents, mockStatus } from "./mock-data";
import type { SystemStatus, Device, DetectionEvent, ControlCommand } from "./types";

export const api = {
  getStatus: (): Promise<SystemStatus> =>
    USE_MOCK ? Promise.resolve(mockStatus) : apiClient.getStatus(),
  getDevices: (): Promise<Device[]> =>
    USE_MOCK ? Promise.resolve(mockDevices) : apiClient.getDevices(),
  getEvents: (params?: { limit?: number; device_id?: string }): Promise<DetectionEvent[]> => {
    if (USE_MOCK) {
      let events = [...mockEvents];
      if (params?.device_id) events = events.filter((e) => e.deviceId === params.device_id);
      if (params?.limit) events = events.slice(0, params.limit);
      return Promise.resolve(events);
    }
    return apiClient.getEvents(params);
  },
  getEventHistory: (hours: number): Promise<DetectionEvent[]> => {
    if (USE_MOCK) {
      const cutoff = Date.now() - hours * 3600_000;
      return Promise.resolve(mockEvents.filter((e) => new Date(e.timestamp).getTime() > cutoff));
    }
    return apiClient.getEventHistory(hours);
  },
  getDeviceEvents: (deviceId: string): Promise<DetectionEvent[]> =>
    USE_MOCK
      ? Promise.resolve(mockEvents.filter((e) => e.deviceId === deviceId))
      : apiClient.getDeviceEvents(deviceId),
  sendCommand: (command: ControlCommand) => {
    if (USE_MOCK) return Promise.resolve({ success: true, message: "Mock command sent" });
    return apiClient.sendCommand(command);
  },
};
