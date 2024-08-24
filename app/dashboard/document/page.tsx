'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { PlusIcon, TableIcon, GridIcon } from 'lucide-react';
import Link from 'next/link';
import FileCardList from './_components/fileCardList';
import { DataTableDemo } from './_components/fileTable';
import { FileCardSkeleton } from './_components/fileCardSkeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileTableSkeleton } from './_components/fileTableSkeleton';
import { FileData } from '@/interfaces/FileData';

export default function DocumentListRoute() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchFileData() {
      try {
        const { data } = await axios.get(`/api/file-access-url`);
        setFiles(data.files || []);
      } catch (error) {
        console.error('Error fetching file data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFileData();
  }, []);

  const handleEdit = (file: FileData) => {
    console.log(file);
  };

  const handleDelete = async (fileId: string) => {
    try {
      await axios.delete(`/api/remove-media?fileId=${fileId}`);
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const filteredFiles = files.filter((file) =>
    file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Documentos</h2>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Modo de Visualização</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onSelect={() => setViewMode('cards')}>
                <GridIcon className="mr-2 h-4 w-4" />
                <span>Cartões</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setViewMode('table')}>
                <TableIcon className="mr-2 h-4 w-4" />
                <span>Tabela</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <Link
              href={'/dashboard/document/create'}
              className="flex align-center justify-center gap-2"
            >
              <PlusIcon className="h-4 w-4 text-white" />
              Novo Documento
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-10">
        <input
          type="text"
          placeholder="Pesquisar documentos..."
          className="w-1/2 p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <FileCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <FileTableSkeleton />
        )
      ) : viewMode === 'cards' ? (
        <FileCardList files={filteredFiles} />
      ) : (
        <DataTableDemo files={filteredFiles} />
      )}
    </div>
  );
}
