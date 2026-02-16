import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DevicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">设备管理</h1>
          <p className="text-muted-foreground">设备列表、在线状态、固件版本、远程控制</p>
        </div>
        <div className="h-10 w-28 rounded-md bg-muted animate-pulse" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>设备列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="ml-auto h-4 w-24 rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
