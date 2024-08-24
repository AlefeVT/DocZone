'use client';

import * as React from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface FileData {
  id: string;
  fileName: string;
  fileType: string;
  createdAt: string;
  url: string;
}

interface DataTableDemoProps {
  files: FileData[];
}

export const columns: ColumnDef<FileData>[] = [
  {
    accessorKey: 'fileName',
    header: 'Nome do Arquivo',
  },
  {
    accessorKey: 'fileType',
    header: 'Tipo de Arquivo',
  },
  {
    accessorKey: 'createdAt',
    header: 'Data de Carregamento',
    cell: ({ getValue }) => {
      const date = new Date(getValue<string>());
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    },
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row, table }) => {
      const file = row.original;
      const meta = table.options.meta || {}; // Acessa meta com um fallback para um objeto vazio
      const { onEdit, onDelete } = meta as {
        onEdit: (file: FileData) => void;
        onDelete: (fileId: string) => void;
      };

      return (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Link href={`/dashboard/document/${file.id}`}>Editar</Link>
          </Button>
          <Button variant="outline" size="sm">
            <Link href={`/dashboard/document/${file.id}/delete`}>Excluir</Link>
          </Button>
        </div>
      );
    },
  },
];

export function DataTableDemo({ files }: DataTableDemoProps) {
  const table = useReactTable({
    data: files,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum arquivo encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}
