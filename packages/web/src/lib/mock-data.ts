import type {
  Device,
  DetectionEvent,
  SystemStatus,
  DeviceTimeSeries,
  BoundingBox,
  DeviceMetrics,
  ConnectionStatus,
  Severity,
} from "./types";

// Deterministic pseudo-random generator using seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function randomInRange(seed: number, min: number, max: number): number {
  return min + seededRandom(seed) * (max - min);
}

function randomChoice<T>(seed: number, arr: T[]): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

// Device names
const deviceNames = [
  "Edge-RK3588-Gate-01",
  "Edge-RK3588-Lobby-02",
  "Edge-RK3588-Parking-03",
  "Edge-RK3588-Warehouse-04",
  "Edge-RK3588-Office-05",
];

const classNames = ["person", "car", "bicycle", "dog", "cat", "truck", "motorcycle"];
const eventTypes: Array<"DETECTION_ALERT" | "SYSTEM_ERROR" | "MODEL_LOADED" | "HEALTH_UPDATE"> = [
  "DETECTION_ALERT",
  "SYSTEM_ERROR",
  "MODEL_LOADED",
  "HEALTH_UPDATE",
];
const severities: Severity[] = ["critical", "warning", "info"];

// Generate device metrics
function generateMetrics(seed: number): DeviceMetrics {
  return {
    cpuUsage: randomInRange(seed, 30, 70),
    npuUsage: randomInRange(seed + 1, 40, 80),
    memoryUsedMb: randomInRange(seed + 2, 1200, 2400),
    temperatureC: randomInRange(seed + 3, 45, 65),
    fps: randomInRange(seed + 4, 15, 30),
  };
}

// Generate mock devices
export const mockDevices: Device[] = deviceNames.map((name, idx) => {
  const seed = idx * 1000;
  const statuses: ConnectionStatus[] = ["online", "online", "online", "online", "degraded"];
  return {
    id: `device-${idx + 1}`,
    name,
    status: statuses[idx],
    firmwareVersion: `v1.${idx + 2}.${idx}`,
    capabilities: ["detection", "tracking", "npu_inference"],
    metrics: generateMetrics(seed),
    lastSeen: new Date(Date.now() - idx * 60000).toISOString(),
  };
});

// Generate bounding boxes
function generateBoxes(seed: number, count: number): BoundingBox[] {
  return Array.from({ length: count }, (_, i) => {
    const s = seed + i * 100;
    return {
      classId: Math.floor(randomInRange(s, 0, classNames.length)),
      className: randomChoice(s + 1, classNames),
      confidence: randomInRange(s + 2, 0.7, 0.99),
      xMin: randomInRange(s + 3, 0.1, 0.4),
      yMin: randomInRange(s + 4, 0.1, 0.4),
      xMax: randomInRange(s + 5, 0.5, 0.9),
      yMax: randomInRange(s + 6, 0.5, 0.9),
    };
  });
}

// Generate mock events
export const mockEvents: DetectionEvent[] = Array.from({ length: 50 }, (_, idx) => {
  const seed = idx * 500;
  const deviceIdx = idx % deviceNames.length;
  const device = mockDevices[deviceIdx];
  const type = randomChoice(seed, eventTypes);
  const severity = randomChoice(seed + 1, severities);
  const timestamp = new Date(Date.now() - idx * 120000).toISOString();

  const descriptions: Record<string, string[]> = {
    DETECTION_ALERT: ["检测到异常目标", "高置信度检测", "多目标同时出现", "目标停留时间过长"],
    SYSTEM_ERROR: ["NPU 温度过高", "内存使用率告警", "推理延迟超时", "网络连接不稳定"],
    MODEL_LOADED: ["模型加载成功", "模型热更新完成", "A/B 测试模型切换"],
    HEALTH_UPDATE: ["设备健康检查通过", "性能指标正常", "固件版本更新"],
  };

  return {
    id: `event-${idx + 1}`,
    deviceId: device.id,
    deviceName: device.name,
    type,
    severity,
    description: randomChoice(seed + 2, descriptions[type]),
    timestamp,
    metadata: {
      traceId: `trace-${idx + 1000}`,
      frameId: String(Math.floor(randomInRange(seed + 3, 1000, 9999))),
    },
    boxes: type === "DETECTION_ALERT" ? generateBoxes(seed + 4, Math.floor(randomInRange(seed + 5, 1, 4))) : undefined,
  };
});

// Generate system status
export const mockStatus: SystemStatus = {
  edge: {
    connectedDevices: mockDevices.filter((d) => d.status === "online").length,
    totalFps: mockDevices.reduce((sum, d) => sum + d.metrics.fps, 0),
    avgNpuUsage: mockDevices.reduce((sum, d) => sum + d.metrics.npuUsage, 0) / mockDevices.length,
    avgTemperature: mockDevices.reduce((sum, d) => sum + d.metrics.temperatureC, 0) / mockDevices.length,
  },
  central: {
    modelLoaded: "yolov8n-rk3588-int8",
    inferenceMode: "vlm",
    uptime: 86400 * 3 + 7200,
    vlmQueueDepth: 2,
  },
  alerts: {
    critical: mockEvents.filter((e) => e.severity === "critical").length,
    warning: mockEvents.filter((e) => e.severity === "warning").length,
    info: mockEvents.filter((e) => e.severity === "info").length,
  },
};

// Generate time series data (96 points = 24 hours, 15-minute intervals)
function generateTimeSeries(deviceId: string, deviceName: string, baseValue: number, variance: number, seed: number): DeviceTimeSeries {
  const now = Date.now();
  const interval = 15 * 60 * 1000; // 15 minutes
  const data = Array.from({ length: 96 }, (_, i) => {
    const timestamp = new Date(now - (95 - i) * interval).toISOString();
    const value = baseValue + randomInRange(seed + i, -variance, variance);
    return { timestamp, value };
  });
  return { deviceId, deviceName, data };
}

export const mockFpsTimeSeries: DeviceTimeSeries[] = mockDevices.map((device, idx) =>
  generateTimeSeries(device.id, device.name, device.metrics.fps, 5, idx * 10000)
);

export const mockLatencyTimeSeries: DeviceTimeSeries[] = mockDevices.map((device, idx) =>
  generateTimeSeries(device.id, device.name, 25, 10, idx * 10000 + 5000)
);

// Generate a single mock event for WebSocket simulation
let eventCounter = 1000;
export function generateMockEvent(): DetectionEvent {
  const seed = Date.now() + eventCounter++;
  const device = randomChoice(seed, mockDevices);
  const type = randomChoice(seed + 1, eventTypes);
  const severity = randomChoice(seed + 2, severities);

  const descriptions: Record<string, string[]> = {
    DETECTION_ALERT: ["检测到异常目标", "高置信度检测", "多目标同时出现"],
    SYSTEM_ERROR: ["NPU 温度过高", "内存使用率告警"],
    MODEL_LOADED: ["模型加载成功", "模型热更新完成"],
    HEALTH_UPDATE: ["设备健康检查通过", "性能指标正常"],
  };

  return {
    id: `event-${eventCounter}`,
    deviceId: device.id,
    deviceName: device.name,
    type,
    severity,
    description: randomChoice(seed + 3, descriptions[type]),
    timestamp: new Date().toISOString(),
    metadata: {
      traceId: `trace-${eventCounter}`,
      frameId: String(Math.floor(randomInRange(seed + 4, 1000, 9999))),
    },
    boxes: type === "DETECTION_ALERT" ? generateBoxes(seed + 5, Math.floor(randomInRange(seed + 6, 1, 3))) : undefined,
  };
}
