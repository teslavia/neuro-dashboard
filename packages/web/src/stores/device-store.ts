import { create } from "zustand";
import type { Device } from "@/lib/types";

interface DeviceState {
  devices: Map<string, Device>;
  selectedDeviceId: string | null;
  connectionStatus: "connected" | "disconnected" | "reconnecting";
  setDevices: (devices: Device[]) => void;
  updateDevice: (device: Device) => void;
  selectDevice: (id: string | null) => void;
  setConnectionStatus: (status: DeviceState["connectionStatus"]) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: new Map(),
  selectedDeviceId: null,
  connectionStatus: "disconnected",
  setDevices: (devices) =>
    set({ devices: new Map(devices.map((d) => [d.id, d])) }),
  updateDevice: (device) =>
    set((state) => {
      const next = new Map(state.devices);
      next.set(device.id, device);
      return { devices: next };
    }),
  selectDevice: (id) => set({ selectedDeviceId: id }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
}));
