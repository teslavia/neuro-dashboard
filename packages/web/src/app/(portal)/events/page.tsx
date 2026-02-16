import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">事件中心</h1>
        <p className="text-muted-foreground">检测事件时间线，按设备/类别/置信度筛选</p>
      </div>
      <div className="flex gap-4">
        <div className="h-10 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-10 w-36 rounded-md bg-muted animate-pulse" />
        <div className="h-10 w-36 rounded-md bg-muted animate-pulse" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>事件列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
                <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
                <div className="h-4 w-24 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
