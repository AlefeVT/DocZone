'use client';

import { DeleteItem } from '@/components/SubmitButtons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import axios from 'axios';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function DeleteRoute({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async (containerId: string) => {
    setIsLoading(true);
    try {
      await axios.post('/api/remove-container', { containerId });
      toast.success('Caixa excluída com sucesso!');
      router.push('/dashboard/container');
    } catch (error) {
      console.error('Error deleting container:', error);
      toast.error('Erro ao excluir a caixa.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await handleDelete(params.id);
  };

  return (
    <div className="h-[80vh] w-full flex items-center justify-center">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Você tem certeza absoluta?</CardTitle>
          <CardDescription>
            Essa ação não pode ser desfeita. Isso excluirá permanentemente todos
            os documentos que estão dentro dessa caixa e removerá todos os dados
            de nossos servidores.
          </CardDescription>
        </CardHeader>
        <CardFooter className="w-full flex justify-between">
          <Button variant={'secondary'} asChild>
            <Link href={'/dashboard/container'}>Cancelar</Link>
          </Button>
          <form onSubmit={handleSubmit}>
            <DeleteItem isLoading={isLoading} />
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
