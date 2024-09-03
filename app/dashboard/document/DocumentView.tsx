'use client';

import { useState, useEffect } from 'react';
import { Header } from './_components/filePageHeader';
import { SearchBar } from './_components/fileSearchBar';
import { Content } from './_components/fileContent';
import { ContainerSelect } from './_components/containerSelect';
import { FileData } from '@/interfaces/FileData';
import { DocumentController } from '@/app/controller/document/DocumentController';
import { DocumentService } from '@/app/service/document/DocumentService';
import { listContainers } from '../container/actions';

export default function DocumentView() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [containers, setContainers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedContainer, setSelectedContainer] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedFiles, fetchedContainers] = await Promise.all([
          DocumentController.fetchFiles(DocumentService),
          listContainers(),
        ]);
        setFiles(fetchedFiles);
        setContainers(fetchedContainers);
      } catch (error) {
        console.error('Falha ao buscar dados (view):', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (viewMode === 'cards') {
      const fetchData = async () => {
        try {
          setLoading(true);
          const fetchedFiles =
            await DocumentController.fetchFiles(DocumentService);
          setFiles(fetchedFiles);
        } catch (error) {
          console.error('Falha ao buscar dados (cards view):', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [viewMode]);

  const handleContainerSelect = (containerId: string) => {
    setSelectedContainer(containerId);
  };

  const filteredFiles = DocumentController.filterFilesByContainerAndSearchTerm(
    files,
    selectedContainer,
    searchTerm
  );

  return (
    <div className="p-4">
      <Header viewMode={viewMode} setViewMode={setViewMode} />
      <div className="flex flex-col sm:flex-row justify-between items-center mt-7 mb-5 space-y-4 sm:space-y-0">
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <ContainerSelect
          containers={containers}
          onSelect={handleContainerSelect}
        />
      </div>
      <Content loading={loading} viewMode={viewMode} files={filteredFiles} />
    </div>
  );
}
