"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { BehaviorEvent, BehaviorType } from "@/lib/types";

const behaviorTypeLabels: Record<BehaviorType, string> = {
  LOITERING: "徘徊",
  RUNNING: "奔跑",
  CROWD: "聚集",
  FALL: "跌倒",
  INTRUSION: "入侵",
  ABANDONED_OBJECT: "遗留物",
};

const behaviorTypeColors: Record<BehaviorType, string> = {
  LOITERING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  RUNNING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  CROWD: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  FALL: "bg-red-500/10 text-red-600 border-red-500/20",
  INTRUSION: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  ABANDONED_OBJECT: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
};

const behaviorTypes: BehaviorType[] = ["LOITERING", "RUNNING", "CROWD", "FALL", "INTRUSION", "ABANDONED_OBJECT"];

export default function BehaviorPage() {
  const [selectedType, setSelectedType] = useState<BehaviorType | "">("");
  const [selectedDevice, setSelectedDevice] = useState("");

  const { data: events, isLoading, refetch } = useApiQuery<BehaviorEvent[]>({
    fetcher: () => apiClient.getBehaviorEvents({
      device_id: selectedDevice || undefined,
      behavior_type: selectedType || undefined,
      limit: 100,
    }),
    refreshInterval: 10000,
  });

  // Count by type
  const typeCounts = events?.reduce((acc, e) => {
    acc[e.behaviorType] = (acc[e.behaviorType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">行为分析</h1>
          <p className="text-muted-foreground">实时行为检测事件监控与统计</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          刷新
        </Button>
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === "" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedType("")}
        >
          全部
        </Button>
        {behaviorTypes.map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(type)}
          >
            {behaviorTypeLabels[type]}
            {typeCounts[type] && (
              <Badge variant="secondary" className="ml-2">
                {typeCounts[type]}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {behaviorTypes.slice(0, 4).map((type) => (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardDescription>{behaviorTypeLabels[type]}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{typeCounts[type] || 0}</div>
              <p className="text-xs text-muted-foreground">最近事件数</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="h-16 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events && events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="outline"
                      className={cn("font-normal", behaviorTypeColors[event.behaviorType])}
                    >
                      {behaviorTypeLabels[event.behaviorType]}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {event.deviceId} · Track #{event.trackId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        置信度: {(event.confidence * 100).toFixed(0)}%
                        {event.metadata?.duration_seconds && (
                          <span className="ml-2">· 持续: {event.metadata.duration_seconds}秒</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString("zh-CN")}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>暂无行为分析事件</p>
            <p className="text-sm mt-1">检测到行为事件后将在此显示</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
