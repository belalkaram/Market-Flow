import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, breadcrumbs, action, actions, className }: PageHeaderProps) {
  const rightContent = actions ?? action;
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-start justify-between gap-3", className)}>
      <div className="space-y-0.5 min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb dir="rtl" className="mb-1">
            <BreadcrumbList>
              {breadcrumbs.map((bc, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <div key={i} className="flex items-center">
                    <BreadcrumbItem>
                      {isLast || !bc.href ? (
                        <BreadcrumbPage>{bc.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={bc.href}>{bc.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && (
                      <BreadcrumbSeparator>
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </BreadcrumbSeparator>
                    )}
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground leading-snug">{subtitle}</p>}
      </div>
      {rightContent && <div className="shrink-0 flex items-center gap-2">{rightContent}</div>}
    </div>
  );
}
