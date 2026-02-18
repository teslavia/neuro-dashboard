"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { ReIDTrack } from "@/lib/types";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
  return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分`;
}

export default function ReIDPage() {
  const [selectedTrack, setSelectedTrack] = useState<ReIDTrack | null>(null);

  const { data: tracks, isLoading, refetch } = useApiQuery<ReIDTrack[]>({
    fetcher: () => apiClient.getReIDTracks({ limit: 50 }),
    refreshInterval: 30000,
  });

  // Calculate stats
  const uniqueDevices = new Set(
    tracks?.flatMap((t) => t.appearances.map((a) => a.deviceId)) || []
  ).size;

  const avgDuration = tracks?.length
    ? tracks.reduce((sum, t) => sum + t.totalDuration, 0) / tracks.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">跨摄像头追踪</h1>
          <p className="text-muted-foreground">ReID 跨设备目标轨迹追踪</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          刷新
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>追踪轨迹</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracks?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>涉及摄像头</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueDevices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>平均持续时间</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(Math.round(avgDuration))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>平均跨摄像头数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tracks?.length
                ? (
                    tracks.reduce((sum, t) => sum + new Set(t.appearances.map((a) => a.deviceId)).size, 0) /
                    tracks.length
                  ).toFixed(1)
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tracks Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Track List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">追踪列表</h2>
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="py-4">
                  <div className="h-20 rounded bg-muted animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : tracks && tracks.length > 0 ? (
            tracks.map((track) => {
              const deviceCount = new Set(track.appearances.map((a) => a.deviceId)).size;
              return (
                <Card
                  key={track.trackId}
                  className={cn(
                    "cursor-pointer transition-colors",
                    selectedTrack?.trackId === track.trackId && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedTrack(track)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{track.globalId}</span>
                          <Badge variant="outline" className="text-xs">
                            {deviceCount} 摄像头
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Track ID: {track.trackId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{formatDuration(track.totalDuration)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(track.firstSeen).toLocaleTimeString("zh-CN")} -{" "}
                          {new Date(track.lastSeen).toLocaleTimeString("zh-CN")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>暂无追踪轨迹</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Track Detail */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">轨迹详情</h2>
          {selectedTrack ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedTrack.globalId}</CardTitle>
                    <CardDescription>Track ID: {selectedTrack.trackId}</CardDescription>
                  </div>
                  <Badge>{selectedTrack.appearances.length} 次出现</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Timeline */}
                <div className="space-y-2">
                  {selectedTrack.appearances.map((appearance, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{appearance.deviceId}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(appearance.timestamp).toLocaleString("zh-CN")}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {(appearance.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">首次出现</span>
                      <p className="font-medium">
                        {new Date(selectedTrack.firstSeen).toLocaleString("zh-CN")}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">最后出现</span>
                      <p className="font-medium">
                        {new Date(selectedTrack.lastSeen).toLocaleString("zh-CN")}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">总持续时间</span>
                      <p className="font-medium">{formatDuration(selectedTrack.totalDuration)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">涉及摄像头</span>
                      <p className="font-medium">
                        {new Set(selectedTrack.appearances.map((a) => a.deviceId)).size}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>选择一个追踪轨迹查看详情</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
