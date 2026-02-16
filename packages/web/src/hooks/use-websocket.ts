"use client";

import { useEffect, useRef, useCallback } from "react";
import { WS_URL, USE_MOCK } from "@/lib/constants";
import { useEventStore } from "@/stores/event-store";
import { useDeviceStore } from "@/stores/device-store";
import { generateMockEvent } from "@/lib/mock-data";
import type { DetectionEvent } from "@/lib/types";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reconnectAttempts = useRef(0);
  const pushEvent = useEventStore((s) => s.pushEvent);
  const setConnectionStatus = useDeviceStore((s) => s.setConnectionStatus);

  const connect = useCallback(() => {
    if (USE_MOCK) {
      setConnectionStatus("connected");
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus("connected");
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as DetectionEvent;
          pushEvent(data);
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        setConnectionStatus("reconnecting");
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
        reconnectAttempts.current++;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      setConnectionStatus("disconnected");
    }
  }, [pushEvent, setConnectionStatus]);

  useEffect(() => {
    connect();

    // Mock mode: generate events every 2-4 seconds
    let mockInterval: ReturnType<typeof setInterval> | undefined;
    if (USE_MOCK) {
      mockInterval = setInterval(() => {
        pushEvent(generateMockEvent());
      }, 2000 + Math.random() * 2000);
    }

    return () => {
      wsRef.current?.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (mockInterval) clearInterval(mockInterval);
    };
  }, [connect, pushEvent]);
}
