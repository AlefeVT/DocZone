'use client';
import { useState, useEffect } from 'react';
import { Header } from './_components/filePageHeader';
import { SearchBar } from './_components/fileSearchBar';
import { Content } from './_components/fileContent';
import { FileData } from '@/interfaces/FileData';
import { DocumentListController } from '@/app/controller/document/DocumentController';
import { DocumentService } from '@/app/service/document/DocumentService';

export default function DocumentView() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFiles = async () => {
    const fetchedFiles =
      await DocumentListController.fetchFiles(DocumentService);
    setFiles(fetchedFiles);
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles(); // Chama ao carregar a página
  }, []);

  useEffect(() => {
    if (viewMode === 'cards') {
      fetchFiles(); // Chama sempre que o modo de visualização mudar para 'cards'
    }
  }, [viewMode]);

  const filterFiles = () => {
    return DocumentListController.filterFiles(files, searchTerm);
  };

  const filteredFiles = filterFiles();

  return (
    <div className="p-4">
      <Header viewMode={viewMode} setViewMode={setViewMode} />
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Content loading={loading} viewMode={viewMode} files={filteredFiles} />
    </div>
  );
}
