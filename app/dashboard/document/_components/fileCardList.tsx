'use client';

import React, { useState } from 'react';
import FileCard from './fileCard';
import { Button } from '@/components/ui/button';

interface FileData {
  id: string;
  fileName: string;
  fileType: string;
  createdAt: string;
  url: string;
}

interface FileCardListProps {
  files: FileData[];
}

export default function FileCardList({ files }: FileCardListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Defina o número de cards por página

  const totalPages = Math.ceil(files.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFiles = files.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentFiles.map((file) => (
          <FileCard key={file.id} file={file} />
        ))}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}
