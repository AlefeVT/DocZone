import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';

export function Header({
  setViewMode,
}: {
  viewMode: 'cards' | 'table';
  setViewMode: (mode: 'cards' | 'table') => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
      <h2 className="text-xl sm:text-2xl font-bold">Caixas</h2>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        
        <Button className="w-full sm:w-auto">
          <Link
            href={'/dashboard/container/create'}
            className="flex items-center justify-center gap-2"
          >
            <PlusIcon className="h-4 w-4 text-white" />
            Nova Caixa
          </Link>
        </Button>
      </div>
    </div>
  );
}
