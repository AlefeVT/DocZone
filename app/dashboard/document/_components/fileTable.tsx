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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import PdfViewerModal from './PdfViewerModal';
import ImageViewerModal from './ImageViewerModal';

interface FileData {
  id: string;
  fileName: string;
  fileType: string;
  createdAt: string;
  url: string;
}

interface FileTableProps {
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
      const { onView } = meta as {
        onView: (file: FileData) => void;
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/dashboard/document/${file.id}`}>Editar</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/dashboard/document/${file.id}/delete`}>
                Excluir
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onView(file)}>
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={file.url} download={file.fileName}>
                Baixar
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function FileTable({ files }: FileTableProps) {
  const [selectedFile, setSelectedFile] = React.useState<FileData | null>(null);
  const [fileUrl, setFileUrl] = React.useState<string | null>(null);

  const handleViewFile = (file: FileData) => {
    if (file.fileType === 'application/pdf') {
      const pdfUrl = `/api/file-stream?fileId=${file.id}`;
      setFileUrl(pdfUrl);
    } else {
      setFileUrl(file.url);
    }
    setSelectedFile(file);
  };

  const table = useReactTable({
    data: files,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onView: handleViewFile,
    },
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

      {selectedFile && selectedFile.fileType === 'application/pdf' && (
        <PdfViewerModal
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
          fileName={selectedFile.fileName}
          fileUrl={fileUrl!} // Exclamação para garantir que fileUrl nunca será nulo
        />
      )}

      {selectedFile && selectedFile.fileType.startsWith('image/') && (
        <ImageViewerModal
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
          fileName={selectedFile.fileName}
          fileUrl={fileUrl!} // Exclamação para garantir que fileUrl nunca será nulo
        />
      )}
    </div>
  );
}
