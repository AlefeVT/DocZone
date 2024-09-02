'use client';

import { useState, useEffect } from 'react';
import { Header } from './_components/containerPageHeader';
import { SearchBar } from './_components/containerSearchBar';
import { Content } from './_components/containerContent';
import { listContainers } from './actions';

export default function ContainerView() {
  const [containers, setContainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchContainers = async () => {
      setLoading(true);
      try {
        const fetchedContainers = await listContainers();
        setContainers(fetchedContainers);
      } catch (error) {
        console.error('Erro ao buscar containers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContainers();
  }, []);

  const filterContainers = () => {
    return containers.filter((container) =>
      container.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredContainers = filterContainers();

  return (
    <div className="p-4">
      <Header />
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Content
        loading={loading}
        containers={filteredContainers}
      />
    </div>
  );
}
