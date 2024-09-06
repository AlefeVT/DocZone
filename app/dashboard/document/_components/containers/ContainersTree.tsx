import { useState, useEffect, useCallback } from 'react';
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/interfaces/ContainerTree';

import ContainerNode from './ContainerNode';
import { GETContainers } from '../../actions';

interface ContainerTreeProps {
  onSelectContainer: (containerId: string) => void;
}

const ContainerTree = ({ onSelectContainer }: ContainerTreeProps) => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [filteredContainers, setFilteredContainers] = useState<Container[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [openContainers, setOpenContainers] = useState<string[]>([]);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const data = await GETContainers();
        setContainers(data);
        setFilteredContainers(data); // Inicialmente, todos os containers são exibidos
      } catch (error) {
        console.error('Erro ao buscar containers:', error);
      }
    };
    fetchContainers();
  }, []);

  // Função recursiva para pesquisar tanto em containers pais quanto filhos
  const filterContainers = useCallback(
    (container: Container, query: string): boolean => {
      const lowerCaseQuery = query.toLowerCase();
      const matchesNameOrDescription =
        container.name.toLowerCase().includes(lowerCaseQuery) ||
        (container.description &&
          container.description.toLowerCase().includes(lowerCaseQuery));

      const matchesChildren = container.children.some((child) =>
        filterContainers(child, query)
      );

      return matchesNameOrDescription || matchesChildren;
    },
    []
  );

  // Filtra e expande os containers com base na busca
  useEffect(() => {
    if (!searchQuery) {
      setFilteredContainers(containers); // Se não houver busca, mostra todos os containers
      setOpenContainers([]);
      return;
    }

    const filtered = containers.filter((container) =>
      filterContainers(container, searchQuery)
    );

    setFilteredContainers(filtered);

    const openContainersSet = new Set<string>();
    const findParentsToOpen = (container: Container) => {
      if (
        container.children.some((child) => filterContainers(child, searchQuery))
      ) {
        openContainersSet.add(container.id);
      }
      container.children.forEach(findParentsToOpen);
    };

    containers.forEach(findParentsToOpen);
    setOpenContainers(Array.from(openContainersSet));
  }, [searchQuery, containers, filterContainers]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reseta a página ao iniciar uma nova busca
  };

  const handleToggleContainer = (containerId: string) => {
    setOpenContainers(
      (prev) =>
        prev.includes(containerId)
          ? prev.filter((id) => id !== containerId) // Fecha se já estiver aberto
          : [...prev, containerId] // Abre se estiver fechado
    );
  };

  const totalPages = Math.ceil(filteredContainers.length / itemsPerPage);
  const paginatedContainers = filteredContainers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => setCurrentPage(newPage);

  return (
    <div className="mx-auto">
      <div className="relative w-full sm:w-1/2 mb-5">
        <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Busque pelo nome ou descrição das caixas..."
          className="pl-8 w-full"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <Card className="flex justify-around max-w-full max-h-[400px] overflow-y-auto overflow-x-auto">
        {paginatedContainers.map((container) => (
          <div className="my-6" key={container.id}>
            <ContainerNode
              key={container.id}
              container={container}
              isOpen={openContainers.includes(container.id)}
              onSelect={onSelectContainer}
              onToggle={handleToggleContainer}
              openContainers={openContainers}
              isRoot
            />
          </div>
        ))}
      </Card>
      <div className="flex justify-end items-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default ContainerTree;
