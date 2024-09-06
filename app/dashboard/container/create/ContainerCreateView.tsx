'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronsUpDown, Check } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/SubmitButtons';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { createContainer } from './actions';
import { toast } from 'sonner';
import { listContainers } from '../actions';

export default function ContainerCreateView() {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [containers, setContainers] = useState<ContainerData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {}
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchContainers() {
      try {
        const data = await listContainers();
        setContainers(data);
      } catch (error) {
        console.error('Error fetching containers:', error);
      }
    }

    fetchContainers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSuccess = () => {
    setName('');
    setDescription('');
    setParentId(null);
    setErrors({});
    toast.success('Caixa criada com sucesso!');
    router.push('/dashboard/container');
  };

  const handleError = (errors: { name?: string; description?: string }) => {
    setErrors(errors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createContainer({ name, description, parentId });

      handleSuccess();
    } catch (error) {
      handleError({
        name: 'Ocorreu um erro ao criar a caixa. Tente novamente.',
      });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtra os containers pelo nome com base no valor da busca
  const filteredContainers = containers.filter((container) =>
    container.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full flex items-center mb-10 gap-8">
        <Button variant={'outline'} size={'icon'} title="Voltar" asChild>
          <Link href={'/dashboard/container'}>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Cadastrar Caixas</h2>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nome da caixa
          </Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            className="block w-[700px] p-2 border border-gray-300 rounded-md"
            placeholder="Digite o nome da caixa"
            required
          />
          {errors.name && <p className="text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Descrição (Opcional)
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) {
                setErrors({ ...errors, description: undefined });
              }
            }}
            className="block w-[800px] p-2 border border-gray-300 rounded-md"
            placeholder="Descreva a caixa (opcional)"
          />
          {errors.description && (
            <p className="text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="parent"
            className="block text-sm font-medium text-gray-700"
          >
            Caixa Pai (Opcional)
          </Label>

          <div ref={dropdownRef} className="relative w-[300px]">
            <Button
              type="button"
              onClick={() => setOpen(!open)}
              variant="outline"
              className="w-[300px] flex justify-between items-center"
            >
              {parentId
                ? containers.find((container) => container.id === parentId)
                    ?.name
                : 'Selecione uma caixa...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open && (
              <div className="absolute z-10 bg-white border border-gray-300 rounded-md w-full mt-2 p-2">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar caixa..."
                  className="w-full p-2 mb-2 border border-gray-300 rounded-md"
                />

                {filteredContainers.length > 0 ? (
                  <ul className="max-h-48 overflow-y-auto">
                    {filteredContainers.map((container) => (
                      <li
                        key={container.id}
                        className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-100"
                        title={container.description || 'Sem descrição'}
                        onClick={() => {
                          setParentId(
                            container.id === parentId ? null : container.id
                          );
                          setOpen(false);
                        }}
                      >
                        <span>{container.name}</span>
                        {parentId === container.id && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    Nenhuma caixa encontrada.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <SubmitButton text="Cadastrar" isLoading={isLoading} />
        </div>
      </form>
    </div>
  );
}
