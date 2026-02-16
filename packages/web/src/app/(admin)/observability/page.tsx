import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ObservabilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">可观测性</h1>
        <p className="text-muted-foreground">Prometheus 指标图表、gRPC 调用链、VLM 队列监控</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {["gRPC 请求量", "VLM 推理延迟", "VLM 队列深度", "Edge 连接数"].map((title) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 rounded bg-muted animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
