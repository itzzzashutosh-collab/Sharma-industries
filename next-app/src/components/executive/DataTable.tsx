"use client";

import { useLanguage } from "@/components/LanguageProvider";

interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = "No records found.",
  onRowClick,
}: DataTableProps<T>) {
  const { t } = useLanguage();

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
        {t(emptyMessage)}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-border/80 text-muted-foreground uppercase font-bold tracking-wider">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`py-3 px-4 ${
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                }`}
              >
                {t(col.header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`border-b border-border/40 hover:bg-muted/30 transition-colors font-medium text-foreground ${
                onRowClick ? "cursor-pointer" : ""
              }`}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`py-3 px-4 ${
                    col.align === "right" ? "text-right font-mono" : col.align === "center" ? "text-center" : "text-left"
                  }`}
                >
                  {col.accessor(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
