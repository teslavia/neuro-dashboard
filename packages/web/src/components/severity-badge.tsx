import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SEVERITY_COLORS } from "@/lib/constants";
import type { Severity } from "@/lib/types";

const severityLabels: Record<Severity, string> = {
  critical: "严重",
  warning: "警告",
  info: "信息",
};

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  return (
    <Badge variant="outline" className={cn(SEVERITY_COLORS[severity], "border", className)}>
      {severityLabels[severity]}
    </Badge>
  );
}
