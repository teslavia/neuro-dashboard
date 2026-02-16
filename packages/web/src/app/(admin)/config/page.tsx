import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">系统配置</h1>
        <p className="text-muted-foreground">config.yaml 可视化编辑、TLS 证书管理、限流/熔断参数</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {["Edge 配置", "Central 配置", "TLS 证书", "限流/熔断"].map((title) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
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
