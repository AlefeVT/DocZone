import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookMinus, PlusIcon, TableProperties, View } from 'lucide-react';
import Link from 'next/link';

export function Header({
  setViewMode,
}: {
  viewMode: 'cards' | 'table';
  setViewMode: (mode: 'cards' | 'table') => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 space-y-4 sm:space-y-0">
      <div>
        {/* <h2 className="text-xl sm:text-2xl font-extrabold">Documentos</h2> */}
        <p className="text-xl sm:text-xl my-5 font-bold">
          Selecione uma caixa que deseja visualizar seus Documentos
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <View className="mr-2 h-4 w-4" />
              Modo de Visualização
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-96 lg:w-52 md:w-52 sm:w-52">
            <DropdownMenuItem onSelect={() => setViewMode('cards')}>
              <BookMinus className="mr-2 h-4 w-4" />
              <span>Cartões</span>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setViewMode('table')}>
              <TableProperties className="mr-2 h-4 w-4" />
              <span>Tabela</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button className="w-full sm:w-auto">
          <Link
            href={'/dashboard/document/create'}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <PlusIcon className="h-4 w-4 text-white" />
            Novo Documento
          </Link>
        </Button>
      </div>
    </div>
  );
}
