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

  const handleDelete = async (fileId: string) => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/remove-media?fileId=${fileId}`);
      toast.success('Documento excluído com sucesso!');
      router.push('/dashboard/document');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Erro ao excluir o documento.');
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
            Essa ação não pode ser desfeita. Isso excluirá permanentemente este
            documento e removerá todos os dados de nossos servidores.
          </CardDescription>
        </CardHeader>
        <CardFooter className="w-full flex justify-between">
          <Button variant={'secondary'} asChild>
            <Link href={'/dashboard/document'}>Cancelar</Link>
          </Button>
          <form onSubmit={handleSubmit}>
            <input type="hidden" name="productId" value={params.id} />
            <DeleteItem isLoading={isLoading} />
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
