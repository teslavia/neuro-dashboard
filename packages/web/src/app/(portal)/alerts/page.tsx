import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">告警管理</h1>
        <p className="text-muted-foreground">告警列表、确认/静默、严重级别过滤</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {["严重", "警告", "信息"].map((label) => (
          <Card key={label}>
            <CardContent className="p-6">
              <div className="h-8 w-16 rounded bg-muted animate-pulse" />
              <p className="mt-2 text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>告警列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
