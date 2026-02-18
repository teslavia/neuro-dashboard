"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { BaselineStats, AnomalyScore } from "@/lib/types";

function getZScoreColor(zScore: number): string {
  const abs = Math.abs(zScore);
  if (abs < 1.5) return "bg-emerald-500";
  if (abs < 2.5) return "bg-amber-500";
  if (abs < 3.5) return "bg-orange-500";
  return "bg-red-500";
}

function getZScoreLabel(zScore: number): string {
  const abs = Math.abs(zScore);
  if (abs < 1.5) return "正常";
  if (abs < 2.5) return "轻微异常";
  if (abs < 3.5) return "异常";
  return "严重异常";
}

export default function AnomalyPage() {
  const [selectedMetric, setSelectedMetric] = useState("");

  const { data: baselines, isLoading: baselinesLoading } = useApiQuery<BaselineStats[]>({
    fetcher: () => apiClient.getBaselines(),
    refreshInterval: 60000,
  });

  const { data: scores, isLoading: scoresLoading, refetch } = useApiQuery<AnomalyScore[]>({
    fetcher: () => apiClient.getAnomalyScores({ hours: 24 }),
    refreshInterval: 30000,
  });

  const filteredScores = selectedMetric
    ? scores?.filter((s) => s.metricName === selectedMetric)
    : scores;

  const anomalyCount = scores?.filter((s) => s.isAnomaly).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">异常基线</h1>
          <p className="text-muted-foreground">基于统计基线的异常检测与 Z-Score 分析</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          刷新
        </Button>
      </div>

      {/* Baseline Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {baselinesLoading ? (
          [1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="h-20 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))
        ) : (
          baselines?.map((baseline) => (
            <Card
              key={baseline.metricName}
              className={cn(
                "cursor-pointer transition-colors",
                selectedMetric === baseline.metricName && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedMetric(
                selectedMetric === baseline.metricName ? "" : baseline.metricName
              )}
            >
              <CardHeader className="pb-2">
                <CardDescription className="capitalize">
                  {baseline.metricName.replace(/_/g, " ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">均值</span>
                    <span className="font-mono">{baseline.mean.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">标准差</span>
                    <span className="font-mono">±{baseline.stdDev.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">样本数</span>
                    <span className="font-mono">{baseline.sampleCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Anomaly Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总样本</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scores?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardHeader className="pb-2">
            <CardDescription>异常数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{anomalyCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>异常率</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {scores?.length ? ((anomalyCount / scores.length) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>状态</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant={anomalyCount > 5 ? "destructive" : "default"}>
              {anomalyCount > 5 ? "需关注" : "正常"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Z-Score Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Z-Score 时间线</CardTitle>
              <CardDescription>
                {selectedMetric
                  ? `筛选: ${selectedMetric.replace(/_/g, " ")}`
                  : "显示全部指标"}
              </CardDescription>
            </div>
            {selectedMetric && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedMetric("")}>
                清除筛选
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {scoresLoading ? (
            <div className="h-40 rounded bg-muted animate-pulse" />
          ) : filteredScores && filteredScores.length > 0 ? (
            <div className="space-y-2">
              {/* Visual Z-Score Bar */}
              <div className="h-8 rounded-lg bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 relative mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-0.5 h-full bg-black/20" style={{ marginLeft: "50%" }} />
                </div>
              </div>

              {/* Score Items */}
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredScores.slice(0, 20).map((score) => (
                  <div
                    key={score.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full",
                          getZScoreColor(score.zScore)
                        )}
                      />
                      <div>
                        <span className="font-mono text-sm">
                          Z={score.zScore.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {score.metricName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {score.isAnomaly && (
                        <Badge variant="destructive" className="text-xs">
                          异常
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(score.timestamp).toLocaleTimeString("zh-CN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>暂无异常分数数据</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
