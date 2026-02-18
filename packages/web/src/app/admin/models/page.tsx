"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Model {
  id: string;
  name: string;
  version: string;
  size: string;
  npuCore: number;
  status: "active" | "standby" | "loading" | "error";
  confidence?: number;
  lastUsed?: string;
}

const mockModels: Model[] = [
  {
    id: "yolov5s-rk3588",
    name: "YOLOv5s",
    version: "v1.0.0",
    size: "8 MB",
    npuCore: 0,
    status: "active",
    confidence: 0.55,
    lastUsed: "刚刚",
  },
  {
    id: "yolov5m-rk3588",
    name: "YOLOv5m",
    version: "v1.0.0",
    size: "23 MB",
    npuCore: 1,
    status: "standby",
    confidence: 0.62,
    lastUsed: "5分钟前",
  },
  {
    id: "yolov8s-rk3588",
    name: "YOLOv8s",
    version: "v1.0.0",
    size: "12 MB",
    npuCore: 2,
    status: "active",
    confidence: 0.78,
    lastUsed: "刚刚",
  },
];

const statusStyles = {
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  standby: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
  loading: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  error: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels = {
  active: "运行中",
  standby: "待机",
  loading: "加载中",
  error: "错误",
};

export default function ModelsPage() {
  const [switchingModel, setSwitchingModel] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);

  // TODO: Replace with real API when backend endpoint is ready
  const { data: models, isLoading } = useApiQuery<Model[]>({
    fetcher: () => Promise.resolve(mockModels),
    refreshInterval: 30000,
  });

  const handleSwitchModel = async (modelId: string) => {
    setSwitchingModel(modelId);
    try {
      await api.sendCommand({
        type: "SWITCH_MODEL_VARIANT",
        parameters: { model_id: modelId },
        commandId: Date.now(),
      });
    } catch (error) {
      console.error("Failed to switch model:", error);
    } finally {
      setSwitchingModel(null);
    }
  };

  const handleReloadModels = async () => {
    setReloading(true);
    try {
      await api.sendCommand({
        type: "RELOAD_MODEL",
        parameters: {},
        commandId: Date.now(),
      });
    } catch (error) {
      console.error("Failed to reload models:", error);
    } finally {
      setReloading(false);
    }
  };

  if (isLoading || !models) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">模型管理</h1>
          <p className="text-muted-foreground">模型列表、一键热加载、A/B 测试</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-24 rounded bg-muted animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-muted animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                  <div className="mt-4 h-9 w-full rounded bg-muted animate-pulse" />
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">模型管理</h1>
          <p className="text-muted-foreground">模型列表、一键热加载、A/B 测试</p>
        </div>
        <Button onClick={handleReloadModels} disabled={reloading}>
          {reloading ? "重载中..." : "重新加载全部"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <Card key={model.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{model.name}</CardTitle>
                <Badge
                  variant="outline"
                  className={cn("font-normal", statusStyles[model.status])}
                >
                  {statusLabels[model.status]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{model.id}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">版本</span>
                  <p className="font-mono">{model.version}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">大小</span>
                  <p className="font-mono">{model.size}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">NPU 核心</span>
                  <p className="font-mono">Core {model.npuCore}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">平均置信度</span>
                  <p className="font-mono">
                    {model.confidence ? `${(model.confidence * 100).toFixed(0)}%` : "-"}
                  </p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                最后使用: {model.lastUsed || "-"}
              </div>

              <Button
                className="w-full"
                variant={model.status === "active" ? "outline" : "default"}
                onClick={() => handleSwitchModel(model.id)}
                disabled={switchingModel === model.id || model.status === "loading"}
              >
                {switchingModel === model.id
                  ? "切换中..."
                  : model.status === "active"
                  ? "当前模型"
                  : "切换到此模型"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* A/B Testing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">A/B 测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">流量分配</p>
              <p className="text-xs text-muted-foreground">
                YOLOv5s: 30% · YOLOv8s: 70%
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                调整比例
              </Button>
              <Button variant="outline" size="sm">
                查看报告
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
