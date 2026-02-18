"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PROMETHEUS_URL, USE_MOCK } from "@/lib/constants";
import { mockFpsTimeSeries, mockLatencyTimeSeries } from "@/lib/mock-data";
import type { DeviceTimeSeries, TimeSeriesPoint } from "@/lib/types";

/**
 * Parse Prometheus text exposition format into metric samples.
 * Handles lines like: np_edge_fps{device_id="edge-001"} 28.5
 */
interface MetricSample {
  name: string;
  labels: Record<string, string>;
  value: number;
}

function parsePrometheusText(text: string): MetricSample[] {
  const samples: MetricSample[] = [];
  for (const line of text.split("\n")) {
    if (!line || line.startsWith("#")) continue;
    // Match: metric_name{label="val",...} value
    const match = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\{([^}]*)\}\s+(.+)$/);
    if (match) {
      const labels: Record<string, string> = {};
      for (const pair of match[2].split(",")) {
        const [k, v] = pair.split("=");
        if (k && v) labels[k.trim()] = v.trim().replace(/"/g, "");
      }
      samples.push({ name: match[1], labels, value: parseFloat(match[3]) });
      continue;
    }
    // Match: metric_name value (no labels)
    const simple = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\s+(.+)$/);
    if (simple) {
      samples.push({ name: simple[1], labels: {}, value: parseFloat(simple[2]) });
    }
  }
  return samples;
}

/**
 * Build time series from accumulated snapshots.
 * Each fetch is one data point; we accumulate over time.
 */
function samplesToTimeSeries(
  history: Map<string, TimeSeriesPoint[]>,
  samples: MetricSample[],
  metricName: string,
  labelKey: string,
  now: string,
): DeviceTimeSeries[] {
  for (const s of samples) {
    if (s.name !== metricName) continue;
    const deviceId = s.labels[labelKey] || "global";
    if (!history.has(deviceId)) history.set(deviceId, []);
    const points = history.get(deviceId)!;
    points.push({ timestamp: now, value: s.value });
    // Keep last 200 points (~1h at 15s interval)
    if (points.length > 200) points.shift();
  }
  return Array.from(history.entries()).map(([deviceId, data]) => ({
    deviceId,
    deviceName: deviceId,
    data,
  }));
}

/**
 * Hook to poll Prometheus /metrics endpoint and build time series.
 *
 * @param metricName - exact Prometheus metric name (e.g. "np_edge_fps")
 * @param labelKey - label to group by (e.g. "device_id")
 * @param intervalMs - poll interval in ms (default 15000)
 */
export function usePrometheus(metricName: string, labelKey = "device_id", intervalMs = 15000) {
  const [data, setData] = useState<DeviceTimeSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const historyRef = useRef<Map<string, TimeSeriesPoint[]>>(new Map());
  const metricRef = useRef(metricName);
  metricRef.current = metricName;

  const fetchData = useCallback(async () => {
    if (USE_MOCK) {
      if (metricRef.current.includes("fps")) {
        setData(mockFpsTimeSeries);
      } else {
        setData(mockLatencyTimeSeries);
      }
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${PROMETHEUS_URL}/metrics`);
      const text = await res.text();
      const samples = parsePrometheusText(text);
      const now = new Date().toISOString();
      const series = samplesToTimeSeries(
        historyRef.current,
        samples,
        metricRef.current,
        labelKey,
        now,
      );
      setData(series);
    } catch {
      // silently fail for metrics
    } finally {
      setIsLoading(false);
    }
  }, [labelKey]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, intervalMs);
    return () => clearInterval(interval);
  }, [fetchData, intervalMs]);

  return { data, isLoading };
}

/**
 * Hook to get a single metric's current value (latest snapshot).
 */
export function usePrometheusGauge(metricName: string, labels?: Record<string, string>) {
  const [value, setValue] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (USE_MOCK) {
      setValue(0);
      return;
    }
    try {
      const res = await fetch(`${PROMETHEUS_URL}/metrics`);
      const text = await res.text();
      const samples = parsePrometheusText(text);
      for (const s of samples) {
        if (s.name !== metricName) continue;
        if (labels) {
          const match = Object.entries(labels).every(([k, v]) => s.labels[k] === v);
          if (!match) continue;
        }
        setValue(s.value);
        return;
      }
    } catch {
      // silently fail
    }
  }, [metricName, labels]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return value;
}
