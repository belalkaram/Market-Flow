import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCounter } from "@/hooks/useGsap";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  className?: string;
  isCurrency?: boolean;
}

export function StatCard({ title, value, icon, description, trend, className, isCurrency }: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]+/g, ""));
  const counterRef = useCounter(isNaN(numericValue) ? 0 : numericValue, 1.5);

  return (
    <Card className={cn("overflow-hidden hover-elevate", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono">
          {typeof value === 'number' ? (
            <span dir="ltr" className="inline-block">
              {isCurrency && "ج.م "}
              <span ref={counterRef}>{value}</span>
            </span>
          ) : (
            value
          )}
        </div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend && (
              <span className={cn("font-medium", trend.isPositive ? "text-emerald-500" : "text-red-500")}>
                {trend.isPositive ? "+" : "-"}{trend.value}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
