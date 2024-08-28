import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GridIcon, PlusIcon, TableIcon } from 'lucide-react';
import Link from 'next/link';

export function Header({
  setViewMode,
}: {
  viewMode: 'cards' | 'table';
  setViewMode: (mode: 'cards' | 'table') => void;
}) {
  return (
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
  );
}
