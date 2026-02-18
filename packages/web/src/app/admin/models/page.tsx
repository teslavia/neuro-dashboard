"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ModelRecord, ABTestResult } from "@/lib/types";

const statusStyles = {
  deployed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
  undeployed: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
};

const statusLabels = {
  deployed: "运行中",
  pending: "加载中",
  failed: "错误",
  undeployed: "未部署",
};

function formatLastUsed(deployedAt: number): string {
  const seconds = Math.floor(Date.now() / 1000 - deployedAt);
  if (seconds < 60) return "刚刚";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`;
  return `${Math.floor(seconds / 86400)}天前`;
}

export default function ModelsPage() {
  const [switchingModel, setSwitchingModel] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);
  const [trafficSplit, setTrafficSplit] = useState(50);
  const [savingSplit, setSavingSplit] = useState(false);

  const { data: models, isLoading: modelsLoading, refetch: refetchModels } = useApiQuery<ModelRecord[]>({
    fetcher: () => api.getModels(),
    refreshInterval: 30000,
  });

  const { data: abTest, isLoading: abTestLoading, refetch: refetchABTest } = useApiQuery<ABTestResult>({
    fetcher: () => api.getABTest(),
    refreshInterval: 10000,
  });

  const handleSwitchModel = async (modelId: string) => {
    setSwitchingModel(modelId);
    try {
      const result = await api.switchModel(modelId);
      if (result.success) {
        // Refetch models to show updated status
        refetchModels();
      }
    } catch (error) {
      console.error("Failed to switch model:", error);
    } finally {
      setSwitchingModel(null);
    }
  };

  const handleReloadModels = async () => {
    setReloading(true);
    try {
      await api.reloadModels();
      refetchModels();
    } catch (error) {
      console.error("Failed to reload models:", error);
    } finally {
      setReloading(false);
    }
  };

  const handleTrafficSplitChange = async (value: number[]) => {
    setTrafficSplit(value[0]);
  };

  const handleSaveSplit = async () => {
    setSavingSplit(true);
    try {
      await api.setABTestSplit(trafficSplit / 100);
      refetchABTest();
    } catch (error) {
      console.error("Failed to update traffic split:", error);
    } finally {
      setSavingSplit(false);
    }
  };

  const handleResetABTest = async () => {
    try {
      await api.resetABTest();
      refetchABTest();
    } catch (error) {
      console.error("Failed to reset A/B test:", error);
    }
  };

  if (modelsLoading || !models) {
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

      {/* Model Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <Card key={model.modelId} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{model.modelId.split("-")[0].toUpperCase()}</CardTitle>
                <Badge
                  variant="outline"
                  className={cn("font-normal", statusStyles[model.status])}
                >
                  {statusLabels[model.status]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{model.modelId}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">版本</span>
                  <p className="font-mono">{model.version}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">大小</span>
                  <p className="font-mono">{model.metadata?.size_mb ? `${model.metadata.size_mb} MB` : "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">NPU 核心</span>
                  <p className="font-mono">{model.npuCore >= 0 ? `Core ${model.npuCore}` : "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">平均置信度</span>
                  <p className="font-mono">
                    {model.metadata?.avg_confidence
                      ? `${((model.metadata.avg_confidence as number) * 100).toFixed(0)}%`
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                最后使用: {formatLastUsed(model.deployedAt)}
              </div>

              <Button
                className="w-full"
                variant={model.status === "deployed" ? "outline" : "default"}
                onClick={() => handleSwitchModel(model.modelId)}
                disabled={switchingModel === model.modelId || model.status === "pending"}
              >
                {switchingModel === model.modelId
                  ? "切换中..."
                  : model.status === "deployed"
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">A/B 测试</CardTitle>
            {abTest?.enabled && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                运行中
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {abTestLoading ? (
            <div className="h-24 rounded bg-muted animate-pulse" />
          ) : abTest?.enabled ? (
            <div className="space-y-6">
              {/* Winner & Confidence */}
              {abTest.winner && abTest.sufficient_samples && (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <p className="font-medium text-emerald-700">胜出模型: {abTest.winner}</p>
                    <p className="text-sm text-emerald-600">
                      置信度: {(abTest.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Traffic Split Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">流量分配</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSaveSplit} disabled={savingSplit}>
                      {savingSplit ? "保存中..." : "保存"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetABTest}>
                      重置
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Control: {100 - trafficSplit}%</span>
                    <span>Treatment: {trafficSplit}%</span>
                  </div>
                  <Slider
                    value={[trafficSplit]}
                    onValueChange={handleTrafficSplitChange}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Variant Metrics */}
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(abTest.variants).map(([name, metrics]) => (
                  <div key={name} className="p-4 rounded-lg border">
                    <p className="font-medium mb-2">{name}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">推理次数</span>
                        <p className="font-mono">{metrics.total_inferences.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">平均延迟</span>
                        <p className="font-mono">{metrics.avg_latency_ms.toFixed(1)} ms</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">准确率</span>
                        <p className="font-mono">{(metrics.accuracy * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">检测数</span>
                        <p className="font-mono">{metrics.total_detections.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!abTest.sufficient_samples && (
                <p className="text-sm text-amber-600 text-center">
                  样本数不足，请继续收集数据...
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>A/B 测试未启用</p>
              <p className="text-sm mt-1">在配置中启用 ab_test.enabled 以开始测试</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
