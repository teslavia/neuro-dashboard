"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PROMETHEUS_URL, USE_MOCK } from "@/lib/constants";
import { mockFpsTimeSeries, mockLatencyTimeSeries } from "@/lib/mock-data";
import type { DeviceTimeSeries } from "@/lib/types";

interface PrometheusResult {
  metric: Record<string, string>;
  values: [number, string][];
}

interface PrometheusResponse {
  status: string;
  data: {
    resultType: string;
    result: PrometheusResult[];
  };
}

function toTimeSeries(results: PrometheusResult[], labelKey: string): DeviceTimeSeries[] {
  return results.map((r) => ({
    deviceId: r.metric[labelKey] || "unknown",
    deviceName: r.metric[labelKey] || "Unknown",
    data: r.values.map(([ts, val]) => ({
      timestamp: new Date(ts * 1000).toISOString(),
      value: parseFloat(val),
    })),
  }));
}

export function usePrometheus(query: string, labelKey = "device_id", rangeHours = 24) {
  const [data, setData] = useState<DeviceTimeSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryRef = useRef(query);
  queryRef.current = query;

  const fetchData = useCallback(async () => {
    if (USE_MOCK) {
      // Return mock data based on query
      if (queryRef.current.includes("fps")) {
        setData(mockFpsTimeSeries);
      } else {
        setData(mockLatencyTimeSeries);
      }
      setIsLoading(false);
      return;
    }

    try {
      const end = Math.floor(Date.now() / 1000);
      const start = end - rangeHours * 3600;
      const step = Math.max(60, Math.floor((rangeHours * 3600) / 200));
      const params = new URLSearchParams({
        query: queryRef.current,
        start: String(start),
        end: String(end),
        step: String(step),
      });
      const res = await fetch(`${PROMETHEUS_URL}/api/v1/query_range?${params}`);
      const json: PrometheusResponse = await res.json();
      if (json.status === "success") {
        setData(toTimeSeries(json.data.result, labelKey));
      }
    } catch {
      // silently fail for metrics
    } finally {
      setIsLoading(false);
    }
  }, [labelKey, rangeHours]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, isLoading };
}
