import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">报表统计</h1>
        <p className="text-muted-foreground">日/周/月检测统计、设备在线率、推理性能趋势</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {["检测趋势", "设备在线率", "推理延迟", "告警分布"].map((title) => (
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
