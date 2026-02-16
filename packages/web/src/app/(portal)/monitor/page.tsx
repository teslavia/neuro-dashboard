import { KpiRow } from "./_components/kpi-row";
import { DeviceGrid } from "./_components/device-grid";
import { LiveEventFeed } from "./_components/live-event-feed";
import { PerformanceChart } from "./_components/performance-chart";

export default function MonitorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">实时监控大屏</h1>
        <p className="text-muted-foreground">设备状态、实时检测流、关键 KPI</p>
      </div>
      <KpiRow />
      <DeviceGrid />
      <div className="grid gap-6 lg:grid-cols-2">
        <LiveEventFeed />
        <PerformanceChart />
      </div>
    </div>
  );
}
