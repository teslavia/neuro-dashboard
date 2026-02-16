"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeverityBadge } from "@/components/severity-badge";
import { useEventStore } from "@/stores/event-store";
import { useWebSocket } from "@/hooks/use-websocket";
import { EVENT_TYPE_LABELS } from "@/lib/constants";

export function LiveEventFeed() {
  useWebSocket();
  const events = useEventStore((s) => s.events);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">实时事件流</CardTitle>
          <span className="text-xs text-muted-foreground">{events.length} 条事件</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">等待事件...</p>
          ) : (
            events.slice(0, 20).map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-md border p-3 text-sm"
              >
                <SeverityBadge severity={event.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{event.deviceName}</span>
                    <span className="text-xs text-muted-foreground">
                      {EVENT_TYPE_LABELS[event.type] || event.type}
                    </span>
                  </div>
                  <p className="text-muted-foreground truncate">{event.description}</p>
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleTimeString("zh-CN")}
                </time>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
