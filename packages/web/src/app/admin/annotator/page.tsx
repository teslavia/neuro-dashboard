"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { AnnotatedSample } from "@/lib/types";

export default function AnnotatorPage() {
  const [showVerified, setShowVerified] = useState<boolean | undefined>(undefined);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"coco" | "yolo">("coco");

  const { data: samples, isLoading, refetch } = useApiQuery<AnnotatedSample[]>({
    fetcher: () => apiClient.getAnnotatedSamples({ verified: showVerified, limit: 100 }),
    refreshInterval: 30000,
  });

  const verifiedCount = samples?.filter((s) => s.verified).length || 0;
  const unverifiedCount = samples?.filter((s) => !s.verified).length || 0;

  const handleExport = async (format: "coco" | "yolo") => {
    setExporting(true);
    setExportFormat(format);
    try {
      const result = await apiClient.exportAnnotations(format);
      alert(`导出成功！${result.count} 个样本已导出为 ${format.toUpperCase()} 格式`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("导出失败");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">自动标注</h1>
          <p className="text-muted-foreground">自动收集高质量标注样本，支持 COCO/YOLO 导出</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            刷新
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总样本数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{samples?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>已验证</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{verifiedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>待验证</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{unverifiedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>验证率</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {samples?.length ? ((verifiedCount / samples.length) * 100).toFixed(0) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Export */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={showVerified === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => setShowVerified(undefined)}
          >
            全部
          </Button>
          <Button
            variant={showVerified === false ? "default" : "outline"}
            size="sm"
            onClick={() => setShowVerified(false)}
          >
            待验证
          </Button>
          <Button
            variant={showVerified === true ? "default" : "outline"}
            size="sm"
            onClick={() => setShowVerified(true)}
          >
            已验证
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("coco")}
            disabled={exporting}
          >
            {exporting && exportFormat === "coco" ? "导出中..." : "导出 COCO"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("yolo")}
            disabled={exporting}
          >
            {exporting && exportFormat === "yolo" ? "导出中..." : "导出 YOLO"}
          </Button>
        </div>
      </div>

      {/* Sample Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="h-40 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : samples && samples.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {samples.map((sample) => (
            <Card key={sample.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-mono">{sample.id}</CardTitle>
                  <Badge
                    variant={sample.verified ? "default" : "outline"}
                    className={cn(
                      sample.verified
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                    )}
                  >
                    {sample.verified ? "已验证" : "待验证"}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {sample.sourceDevice} · {new Date(sample.capturedAt).toLocaleString("zh-CN")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder for image */}
                <div className="aspect-video rounded-lg bg-muted mb-3 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">图像预览</span>
                </div>

                {/* Annotations */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">标注 ({sample.annotations.length})</p>
                  {sample.annotations.map((ann, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="capitalize">{ann.className}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {(ann.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>暂无标注样本</p>
            <p className="text-sm mt-1">系统将自动收集高置信度检测样本</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
