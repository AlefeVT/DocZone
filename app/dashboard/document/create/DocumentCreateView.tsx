"use client";

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
import { fileUploadSchema } from '@/schemas';

type SelectItemType = {
  value: string;
  label: string;
};

export default function DocumentCreateView() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string>(''); 
  const [errors, setErrors] = useState<{
    selectedFile?: string;
    selectedContainer?: string; 
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

  const handleSuccess = (fileUrls: string[]) => {
    console.log('Upload bem-sucedido:', fileUrls);
    setSelectedFiles([]);
    setErrors({});
    router.push('/dashboard/document');
  };

  const handleError = (errors: {
    selectedFile?: string;
    selectedContainer?: string;
  }) => {
    console.log('Erro na validação:', errors);
    setErrors(errors);
  };

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      console.log('Arquivos selecionados:', fileArray); 
      setSelectedFiles(fileArray);
      setErrors((prevErrors) => ({
        ...prevErrors,
        selectedFile: undefined,
      }));
    }
  };

  const handleContainerChange = (value: string) => {
    setSelectedContainer(value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      selectedContainer: undefined,
    }));
  };

  const validateForm = () => {
    console.log('Arquivos antes da validação:', selectedFiles);
    console.log('Caixa selecionada antes da validação:', selectedContainer);
  
    const validationInput = {
      selectedFile: selectedFiles,
      selectedContainer,
    };
  
    console.log('Dados passados para a validação:', validationInput);
  
    const validation = fileUploadSchema.safeParse(validationInput);
  
    if (!validation.success) {
      const formErrors = validation.error.format();
      setErrors({
        selectedFile: formErrors.selectedFile?._errors[0],
        selectedContainer: formErrors.selectedContainer?._errors[0],
      });
      return false;
    }
  
    setErrors({});
    return true;
  };
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      setIsLoading(true);

      try {
        await DocumentCreateController.handleSubmit(
          e,
          selectedFiles,
          selectedContainer,
          setIsLoading,
          handleSuccess,
          handleError
        );
      } catch (error) {
        console.error("Erro durante o envio:", error);
        setIsLoading(false);
      }
    } else {
      console.error('Falha na validação do formulário');
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
        onSubmit={handleSubmit} 
        className="w-full space-y-4"
      >
        <div className="space-y-2 mb-10">
          <Label
            htmlFor="selectedContainer"
            className="block text-sm font-medium text-gray-700"
          >
            Selecione a Caixa
          </Label>
          <Select
            onValueChange={handleContainerChange}
            value={selectedContainer}
          >
            <SelectTrigger className="w-1/2 p-2 border border-gray-300 rounded-md">
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
          <div className="space-y-2">
            <FileUploadDropzone
              onFileChange={(e) => handleFileChange(e.target.files)}
            />
            {errors.selectedFile && (
              <p className="text-red-500">{errors.selectedFile}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <SelectedFileCard
              key={index}
              fileName={file.name}
              fileSize={file.size}
              onRemove={() =>
                DocumentCreateController.handleRemoveFile(
                  index,
                  selectedFiles,
                  setSelectedFiles,
                  (message: string) =>
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
