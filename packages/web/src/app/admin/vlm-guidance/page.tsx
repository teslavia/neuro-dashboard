"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { VLMGuidanceResult, ConfigAdjustment } from "@/lib/types";

const impactStyles = {
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  high: "bg-red-500/10 text-red-600 border-red-500/20",
};

const impactLabels = {
  low: "低影响",
  medium: "中影响",
  high: "高影响",
};

function AdjustmentCard({ adjustment }: { adjustment: ConfigAdjustment }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{adjustment.parameter}</span>
          <Badge variant="outline" className={cn("text-xs", impactStyles[adjustment.impact])}>
            {impactLabels[adjustment.impact]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{adjustment.reason}</p>
      </div>
      <div className="text-right">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{String(adjustment.currentValue)}</span>
          <span className="text-muted-foreground">→</span>
          <span className="font-medium text-emerald-600">{String(adjustment.suggestedValue)}</span>
        </div>
      </div>
    </div>
  );
}

export default function VLMGuidancePage() {
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const { data: guidances, isLoading, refetch } = useApiQuery<VLMGuidanceResult[]>({
    fetcher: () => apiClient.getVLMGuidance(),
    refreshInterval: 30000,
  });

  const handleApply = async (guidanceId: string) => {
    setApplyingId(guidanceId);
    try {
      await apiClient.applyVLMGuidance(guidanceId);
      refetch();
    } catch (error) {
      console.error("Failed to apply guidance:", error);
    } finally {
      setApplyingId(null);
    }
  };

  const pendingGuidances = guidances?.filter((g) => !g.applied) || [];
  const appliedGuidances = guidances?.filter((g) => g.applied) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">VLM 配置引导</h1>
          <p className="text-muted-foreground">基于视觉语言模型的智能配置建议</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          刷新
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>待处理建议</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingGuidances.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>已应用建议</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{appliedGuidances.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>高影响建议</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingGuidances.filter((g) => g.adjustments.some((a) => a.impact === "high")).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Guidances */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">待处理建议</h2>
        {isLoading ? (
          [1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="h-32 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))
        ) : pendingGuidances.length > 0 ? (
          pendingGuidances.map((guidance) => (
            <Card key={guidance.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{guidance.deviceId}</CardTitle>
                    <CardDescription>
                      {new Date(guidance.timestamp).toLocaleString("zh-CN")}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => handleApply(guidance.id)}
                    disabled={applyingId === guidance.id}
                  >
                    {applyingId === guidance.id ? "应用中..." : "应用建议"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Analysis */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-1">分析结果</p>
                  <p className="text-sm text-muted-foreground">{guidance.analysis}</p>
                </div>

                {/* Adjustments */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">建议调整</p>
                  {guidance.adjustments.map((adj, idx) => (
                    <AdjustmentCard key={idx} adjustment={adj} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>暂无待处理的配置建议</p>
              <p className="text-sm mt-1">VLM 将自动分析场景并生成建议</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Applied Guidances (collapsed) */}
      {appliedGuidances.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">已应用建议</h2>
          {appliedGuidances.slice(0, 3).map((guidance) => (
            <Card key={guidance.id} className="opacity-60">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{guidance.deviceId}</p>
                    <p className="text-sm text-muted-foreground">{guidance.analysis}</p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">
                    已应用
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
