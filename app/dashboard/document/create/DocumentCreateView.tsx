'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import FileUploadDropzone from './_components/fileUploadDropzone';
import SelectedFileCard from './_components/selectedFileCard';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/SubmitButtons';
import { DocumentCreateController } from '../../../controller/document/DocumentCreateController';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listContainers } from '../../container/actions';

type SelectItemType = {
  value: string;
  label: string;
};

export default function DocumentCreateView() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string>(''); // Estado para o container selecionado
  const [errors, setErrors] = useState<{
    selectedFile?: string;
    selectedContainer?: string; // Adicionado para lidar com erros de seleção de container
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const [containers, setContainers] = useState<SelectItemType[]>([]);

  useEffect(() => {
    async function fetchContainers() {
      const data = await listContainers();
      setContainers(
        data.map((container: any) => ({
          value: container.id,
          label: container.name,
        }))
      );
    }
    fetchContainers();
  }, []);

  const handleSuccess = () => {
    setSelectedFiles([]);
    setErrors({});
    router.push('/dashboard/document');
  };

  const handleError = (errors: {
    selectedFile?: string;
    selectedContainer?: string;
  }) => {
    setErrors(errors);
  };

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
      setErrors((prevErrors) => ({
        ...prevErrors,
        selectedFile: undefined,
      }));
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full flex items-center mb-10 gap-8">
        <Button variant={'outline'} size={'icon'} title="Voltar" asChild>
          <Link href={'/dashboard/document'}>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Carregar Documentos</h2>
      </div>

      <form
        onSubmit={(e) =>
          DocumentCreateController.handleSubmit(
            e,
            selectedFiles[0]?.name || '', 
            selectedFiles,
            selectedContainer, 
            setIsLoading,
            handleSuccess,
            handleError
          )
        }
        className="w-full space-y-4"
      >
        <div className="space-y-2">
          <Label
            htmlFor="selectedContainer"
            className="block text-sm font-medium text-gray-700"
          >
            Selecione a Caixa
          </Label>
          <Select onValueChange={(value) => {
            setSelectedContainer(value);
            if (errors.selectedContainer) {
              setErrors({ ...errors, selectedContainer: undefined });
            }
          }}>
            <SelectTrigger className="w-[180px] p-2 border border-gray-300 rounded-md">
              <SelectValue placeholder="Selecione a Caixa" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Caixas Disponíveis</SelectLabel>
                {containers.map((container) => (
                  <SelectItem key={container.value} value={container.value}>
                    {container.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.selectedContainer && (
            <p className="text-red-500">{errors.selectedContainer}</p>
          )}
        </div>

        {!selectedFiles.length ? (
          <>
            <FileUploadDropzone
              onFileChange={(e) => handleFileChange(e.target.files)}
            />
            {errors.selectedFile && (
              <p className="text-red-500">{errors.selectedFile}</p>
            )}
          </>
        ) : (
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <SelectedFileCard
                key={index}
                fileName={file.name}
                fileSize={file.size}
                onRemove={() =>
                  DocumentCreateController.handleRemoveFile(
                    index, // Índice do arquivo a ser removido
                    selectedFiles, // Arquivos atuais
                    setSelectedFiles, // Função para atualizar os arquivos
                    (message) =>
                      setErrors((prevErrors) => ({
                        ...prevErrors,
                        selectedFile: message,
                      }))
                  )
                }
              />
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <SubmitButton text="Carregar" isLoading={isLoading} />
        </div>
      </form>
    </div>
  );
}
