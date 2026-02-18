"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { ConfigValidationResponse } from "@/lib/types";

interface ConfigSection {
  key: string;
  title: string;
  description: string;
  icon: string;
  fields: ConfigField[];
}

interface ConfigField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select";
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

const configSections: ConfigSection[] = [
  {
    key: "edge",
    title: "Edge 配置",
    description: "边缘设备推理参数",
    icon: "📷",
    fields: [
      { key: "device_id", label: "设备 ID", type: "text" },
      { key: "camera_device", label: "摄像头设备", type: "text" },
      { key: "fps", label: "帧率 (FPS)", type: "number", min: 1, max: 120 },
      { key: "confidence_threshold", label: "置信度阈值", type: "number", min: 0, max: 1, step: 0.05 },
      { key: "nms_threshold", label: "NMS 阈值", type: "number", min: 0, max: 1, step: 0.05 },
      { key: "enable_grpc", label: "启用 gRPC", type: "boolean" },
      { key: "grpc_server", label: "gRPC 服务器地址", type: "text" },
    ],
  },
  {
    key: "central",
    title: "Central 配置",
    description: "中央服务器参数",
    icon: "🖥️",
    fields: [
      { key: "host", label: "监听地址", type: "text" },
      { key: "port", label: "端口", type: "number", min: 1, max: 65535 },
      { key: "inference_mode", label: "推理模式", type: "select", options: ["llm", "vlm"] },
      { key: "max_message_size_mb", label: "最大消息大小 (MB)", type: "number", min: 1, max: 100 },
    ],
  },
  {
    key: "tls",
    title: "TLS 证书",
    description: "安全传输配置",
    icon: "🔒",
    fields: [
      { key: "enabled", label: "启用 TLS", type: "boolean" },
      { key: "ca_cert", label: "CA 证书路径", type: "text" },
      { key: "server_cert", label: "服务器证书路径", type: "text" },
      { key: "server_key", label: "服务器密钥路径", type: "text" },
    ],
  },
  {
    key: "storage",
    title: "存储配置",
    description: "数据持久化设置",
    icon: "💾",
    fields: [
      { key: "db_path", label: "数据库路径", type: "text" },
      { key: "retention_days", label: "数据保留天数", type: "number", min: 1, max: 365 },
    ],
  },
  {
    key: "circuit_breaker",
    title: "熔断器",
    description: "故障保护机制",
    icon: "⚡",
    fields: [
      { key: "failure_threshold", label: "失败阈值", type: "number", min: 1, max: 20 },
      { key: "recovery_timeout", label: "恢复超时 (秒)", type: "number", min: 1, max: 300 },
      { key: "half_open_max", label: "半开状态最大请求数", type: "number", min: 1, max: 10 },
    ],
  },
  {
    key: "rate_limiting",
    title: "限流配置",
    description: "请求速率限制",
    icon: "🚦",
    fields: [
      { key: "enabled", label: "启用限流", type: "boolean" },
      { key: "max_rps", label: "最大 RPS", type: "number", min: 1, max: 10000 },
      { key: "burst", label: "突发容量", type: "number", min: 1, max: 100 },
    ],
  },
  {
    key: "sessions",
    title: "会话管理",
    description: "设备会话配置",
    icon: "🔗",
    fields: [
      { key: "heartbeat_interval", label: "心跳间隔 (秒)", type: "number", min: 1, max: 60 },
      { key: "expiry_timeout", label: "过期超时 (秒)", type: "number", min: 10, max: 300 },
      { key: "max_devices", label: "最大设备数", type: "number", min: 1, max: 100 },
    ],
  },
  {
    key: "ab_test",
    title: "A/B 测试",
    description: "模型对比测试配置",
    icon: "📊",
    fields: [
      { key: "enabled", label: "启用 A/B 测试", type: "boolean" },
      { key: "traffic_split", label: "流量分配", type: "number", min: 0, max: 1, step: 0.1 },
      { key: "min_samples", label: "最小样本数", type: "number", min: 10, max: 1000 },
    ],
  },
  {
    key: "anomaly",
    title: "异常检测",
    description: "基线异常检测配置",
    icon: "📈",
    fields: [
      { key: "enabled", label: "启用异常检测", type: "boolean" },
      { key: "baseline_window_hours", label: "基线窗口 (小时)", type: "number", min: 1, max: 720 },
      { key: "z_score_threshold", label: "Z-Score 阈值", type: "number", min: 1, max: 10, step: 0.5 },
    ],
  },
];

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split(".");
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== "object") {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

export default function ConfigPage() {
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [originalConfig, setOriginalConfig] = useState<Record<string, unknown>>({});
  const [configPath, setConfigPath] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    setHasChanges(JSON.stringify(config) !== JSON.stringify(originalConfig));
  }, [config, originalConfig]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getConfig();
      setConfig(response.config);
      setOriginalConfig(JSON.parse(JSON.stringify(response.config)));
      setConfigPath(response.path);
      setValidationErrors([]);
    } catch (error) {
      console.error("Failed to load config:", error);
      // Set demo config on error
      const demoConfig = {
        edge: {
          device_id: "edge-001",
          camera_device: "/dev/video0",
          fps: 30,
          confidence_threshold: 0.5,
          nms_threshold: 0.45,
          enable_grpc: true,
          grpc_server: "192.168.1.100:50051",
        },
        central: {
          host: "0.0.0.0",
          port: 50051,
          inference_mode: "llm",
          max_message_size_mb: 16,
        },
        tls: { enabled: false },
        storage: { db_path: "data/detections.db", retention_days: 7 },
        circuit_breaker: { failure_threshold: 5, recovery_timeout: 30, half_open_max: 1 },
        rate_limiting: { enabled: false, max_rps: 100, burst: 20 },
        sessions: { heartbeat_interval: 10, expiry_timeout: 30, max_devices: 16 },
        ab_test: { enabled: false, traffic_split: 0.5, min_samples: 100 },
        anomaly: { enabled: false, baseline_window_hours: 168, z_score_threshold: 3 },
      };
      setConfig(demoConfig);
      setOriginalConfig(JSON.parse(JSON.stringify(demoConfig)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (sectionKey: string, fieldKey: string, value: unknown) => {
    const newConfig = { ...config };
    setNestedValue(newConfig, `${sectionKey}.${fieldKey}`, value);
    setConfig(newConfig);
  };

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const result: ConfigValidationResponse = await apiClient.validateConfig(config);
      setValidationErrors(result.errors);
    } catch (error) {
      console.error("Validation failed:", error);
      setValidationErrors(["无法连接到验证服务"]);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await apiClient.updateConfig(config);
      if (result.success) {
        setOriginalConfig(JSON.parse(JSON.stringify(config)));
        setValidationErrors([]);
        alert("配置已保存！");
      } else {
        setValidationErrors(result.errors || [result.message || "保存失败"]);
      }
    } catch (error) {
      console.error("Failed to save config:", error);
      setValidationErrors(["保存配置时发生错误"]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(JSON.parse(JSON.stringify(originalConfig)));
    setValidationErrors([]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">系统配置</h1>
          <p className="text-muted-foreground">config.yaml 可视化编辑、校验与保存</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-32 rounded bg-muted animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                      <div className="h-8 w-40 rounded bg-muted animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">系统配置</h1>
          <p className="text-muted-foreground">
            config.yaml 可视化编辑、校验与保存
          </p>
          {configPath && (
            <p className="text-xs text-muted-foreground mt-1 font-mono">{configPath}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleValidate} disabled={isValidating}>
            {isValidating ? "验证中..." : "验证配置"}
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            重置
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? "保存中..." : "保存配置"}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <span className="text-red-500">⚠️</span>
              <div>
                <p className="font-medium text-red-700">配置验证错误</p>
                <ul className="text-sm text-red-600 mt-1 list-disc list-inside">
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Changes indicator */}
      {hasChanges && (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <span>●</span>
          <span>有未保存的更改</span>
        </div>
      )}

      {/* Config Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {configSections.map((section) => {
          const sectionConfig = config[section.key] as Record<string, unknown> | undefined;

          return (
            <Card key={section.key}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{section.icon}</span>
                  <div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.fields.map((field) => {
                    const rawValue = sectionConfig?.[field.key];
                    const value = rawValue !== undefined ? rawValue : "";

                    return (
                      <div key={field.key} className="flex items-center justify-between gap-4">
                        <label className="text-sm text-muted-foreground shrink-0">
                          {field.label}
                        </label>
                        {field.type === "boolean" ? (
                          <button
                            onClick={() => handleFieldChange(section.key, field.key, !value)}
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                              value ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-600"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                value ? "translate-x-6" : "translate-x-1"
                              )}
                            />
                          </button>
                        ) : field.type === "select" ? (
                          <select
                            value={String(value ?? "")}
                            onChange={(e) => handleFieldChange(section.key, field.key, e.target.value)}
                            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                          >
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            type={field.type}
                            value={String(value)}
                            onChange={(e) => {
                              const newValue = field.type === "number"
                                ? parseFloat(e.target.value) || 0
                                : e.target.value;
                              handleFieldChange(section.key, field.key, newValue);
                            }}
                            className="w-40"
                            min={field.min}
                            max={field.max}
                            step={field.step}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
