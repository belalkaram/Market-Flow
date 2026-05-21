import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { EmptyState } from "./EmptyState";

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
  onExport?: () => void;
  pageSize?: number;
}

export function DataTable<T>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "بحث...",
  actions,
  onExport,
  pageSize = 10,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = searchKey && searchQuery
    ? data.filter(item => {
        const val = item[searchKey as keyof T];
        return String(val).toLowerCase().includes(searchQuery.toLowerCase());
      })
    : data;

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {searchKey && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pr-9 h-9"
              data-testid="input-table-search"
            />
          </div>
        )}
        <div className="flex gap-2 w-full sm:w-auto justify-end shrink-0">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} data-testid="button-export">
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </Button>
          )}
          {actions}
        </div>
      </div>

      {/* Table with horizontal scroll on mobile */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                {columns.map((col, i) => (
                  <TableHead
                    key={i}
                    className={cn("text-right font-semibold whitespace-nowrap", col.className)}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center">
                    <EmptyState
                      title="لا توجد بيانات"
                      description="لم يتم العثور على أي سجلات مطابقة."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, i) => (
                  <TableRow key={i} className="hover:bg-muted/30">
                    {columns.map((col, j) => (
                      <TableCell key={j} className={cn("whitespace-nowrap", col.className)}>
                        {col.cell
                          ? col.cell(item)
                          : String(item[col.accessorKey as keyof T] ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>
            عرض {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredData.length)} من {filteredData.length} سجل
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              data-testid="button-prev-page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="px-3 py-1 text-sm font-medium">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              data-testid="button-next-page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
