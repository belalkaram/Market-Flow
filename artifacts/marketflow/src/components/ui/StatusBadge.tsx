import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Mapping logic for standard ERP statuses to colors and Arabic labels
  let colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  let label = status;

  const statusMap: Record<string, { label: string; color: string }> = {
    // General
    'active': { label: 'نشط', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
    'inactive': { label: 'غير نشط', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
    'closed': { label: 'مغلق', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    
    // Sales / Orders
    'completed': { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
    'returned': { label: 'مرتجع', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    'suspended': { label: 'معلق', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    
    // Purchase Orders
    'draft': { label: 'مسودة', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
    'sent': { label: 'مُرسل', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    'partially_received': { label: 'مستلم جزئياً', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    'received': { label: 'مستلم', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
    'cancelled': { label: 'ملغي', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    
    // Inventory
    'good': { label: 'جيد', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
    'low': { label: 'منخفض', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    'out_of_stock': { label: 'نفد', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    
    // Movements
    'sale': { label: 'بيع', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    'purchase': { label: 'شراء', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
    'return': { label: 'مرتجع', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    'transfer': { label: 'تحويل', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    'waste': { label: 'هالك', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    'adjustment': { label: 'تعديل', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
  };

  const mappedStatus = statusMap[status.toLowerCase()];
  
  if (mappedStatus) {
    label = mappedStatus.label;
    colorClass = mappedStatus.color;
  }

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent", colorClass, className)}>
      {label}
    </span>
  );
}
