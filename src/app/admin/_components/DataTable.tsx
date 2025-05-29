"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@nextui-org/react";

interface DataTableProps<TData> {
  columns: {
    key: string;
    label: string;
    render?: (item: TData) => React.ReactNode;
  }[];
  data: TData[];
  isLoading?: boolean;
  searchKey?: string;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
}: DataTableProps<TData>) {
  return (
    <div className="rounded-md border">
      <Table aria-label="Data table">
        <TableHeader>
          {columns.map((column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          ))}
        </TableHeader>
        <TableBody
          items={data}
          loadingContent={<div>Yükleniyor...</div>}
          loadingState={isLoading ? "loading" : "idle"}
        >
          {(item) => (
            <TableRow key={(item as any).id}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render
                    ? column.render(item)
                    : (item as any)[column.key]}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
