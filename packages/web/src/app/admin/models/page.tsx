import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ModelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">模型管理</h1>
        <p className="text-muted-foreground">模型列表、一键热加载、A/B 测试</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {["yolov8n-rk3588", "yolov8s-rk3588", "yolov8m-rk3588"].map((model) => (
          <Card key={model}>
            <CardHeader>
              <CardTitle className="text-base">{model}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                <div className="mt-4 h-9 w-full rounded bg-muted animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
