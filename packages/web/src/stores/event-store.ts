import { create } from "zustand";
import type { DetectionEvent, Severity } from "@/lib/types";

interface EventFilters {
  deviceId?: string;
  severity?: Severity;
  type?: string;
}

interface EventState {
  events: DetectionEvent[];
  maxEvents: number;
  unacknowledgedCount: number;
  filters: EventFilters;
  pushEvent: (event: DetectionEvent) => void;
  setEvents: (events: DetectionEvent[]) => void;
  acknowledgeAll: () => void;
  setFilters: (filters: EventFilters) => void;
  filteredEvents: () => DetectionEvent[];
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  maxEvents: 500,
  unacknowledgedCount: 0,
  filters: {},
  pushEvent: (event) =>
    set((state) => {
      const next = [event, ...state.events].slice(0, state.maxEvents);
      return { events: next, unacknowledgedCount: state.unacknowledgedCount + 1 };
    }),
  setEvents: (events) => set({ events: events.slice(0, get().maxEvents) }),
  acknowledgeAll: () => set({ unacknowledgedCount: 0 }),
  setFilters: (filters) => set({ filters }),
  filteredEvents: () => {
    const { events, filters } = get();
    return events.filter((e) => {
      if (filters.deviceId && e.deviceId !== filters.deviceId) return false;
      if (filters.severity && e.severity !== filters.severity) return false;
      if (filters.type && e.type !== filters.type) return false;
      return true;
    });
  },
}));
