'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import FileUploadDropzone from '../../create/_components/fileUploadDropzone';
import SelectedFileCard from '../../create/_components/selectedFileCard';
import { SubmitButton } from '@/components/SubmitButtons';
import { ChangeEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fileUpdateSchema } from '@/schemas';
import { listContainers } from '@/app/dashboard/container/actions';

type SelectItemType = {
  value: string;
  label: string;
};

export function DocumentEditForm({ data }: DocumentData) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState<string>(data.fileName || '');
  const [selectedContainer, setSelectedContainer] = useState<string>(data.containerId || '');
  const [errors, setErrors] = useState<{
    customFileName?: string;
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

  useEffect(() => {
    if (data.fileName && data.fileSize) {
      const simulatedFile = new File([data.fileName], data.fileName, {
        type: data.fileType,
        lastModified: new Date(data.createdAt).getTime(),
      });

      Object.defineProperty(simulatedFile, 'size', {
        value: parseInt(data.fileSize, 10),
        writable: false,
      });

      setSelectedFile(simulatedFile);
    }
  }, [data.fileName, data.fileSize, data.fileType, data.createdAt]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrors((prevErrors) => ({ ...prevErrors, selectedFile: undefined }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        selectedFile: 'Selecione um arquivo válido.',
      }));
    }
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setErrors((prevErrors) => ({
      ...prevErrors,
      selectedFile: 'Um documento válido deve ser selecionado',
    }));
  }

  function handleContainerChange(value: string) {
    setSelectedContainer(value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      selectedContainer: undefined,
    }));
  }

  function validateForm() {
    const validationInput = {
        customFileName,
        selectedFile,
        selectedContainer,
    };

    console.log('Validation input:', validationInput);

    const validation = fileUpdateSchema.safeParse(validationInput);

    if (!validation.success) {
        const formErrors = validation.error.format();
        console.error('Form Errors:', formErrors);
        setErrors({
            customFileName: formErrors.customFileName?._errors[0],
            selectedFile: formErrors.selectedFile?._errors[0],
            selectedContainer: formErrors.selectedContainer?._errors[0],
        });
        return false;
    }

    setErrors({});
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    if (validateForm()) {
      try {
        const formData = new FormData();
        formData.append('fileKey', data.key);

        if (customFileName !== data.fileName) {
          formData.append('newFileName', customFileName);
        }
        if (selectedContainer !== data.containerId) {
          formData.append('containerId', selectedContainer);
        }

        // Somente adiciona o arquivo ao formData se um novo arquivo foi selecionado
        if (selectedFile && selectedFile.name !== data.fileName) {
          formData.append('newFileType', selectedFile.type);
          formData.append('newFileSize', selectedFile.size.toString());
          formData.append('file', selectedFile);
        }

        const response = await fetch('/api/update-media', {
          method: 'PUT',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha ao atualizar o arquivo');
        }

        toast.success('Documento editado com sucesso!');
        router.push('/dashboard/document');
      } catch (error) {
        console.error('Erro ao atualizar o arquivo:', error);
        toast.error('Erro ao tentar editar o documento!');
      } finally {
        setIsLoading(false);
      }
    } else {
      console.error('Falha na validação do formulário');
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full flex items-center mb-10 gap-8">
        <Button variant={'outline'} size={'icon'} title="Voltar" asChild>
          <Link href={'/dashboard/document'}>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>

        <h2 className="text-2xl font-bold">Editar Documento</h2>
      </div>

      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label
            htmlFor="customFileName"
            className="block text-sm font-medium text-gray-700"
          >
            Nome do documento
          </Label>
          <Input
            type="text"
            id="customFileName"
            value={customFileName}
            onChange={(e) => {
              setCustomFileName(e.target.value);
              setErrors((prevErrors) => ({
                ...prevErrors,
                customFileName: undefined,
              }));
            }}
            className="block w-full p-2 border border-gray-300 rounded-md"
            placeholder="Digite o nome do documento"
            required
          />
          {errors.customFileName && (
            <p className="text-red-500">{errors.customFileName}</p>
          )}
        </div>

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

        {!selectedFile ? (
          <>
            <FileUploadDropzone onFileChange={handleFileChange} />
            {errors.selectedFile && (
              <p className="text-red-500">{errors.selectedFile}</p>
            )}
          </>
        ) : (
          <SelectedFileCard
            fileName={selectedFile.name}
            fileSize={selectedFile.size}
            onRemove={handleRemoveFile}
          />
        )}

        <div className="flex justify-end">
          <SubmitButton text="Atualizar" isLoading={isLoading} />
        </div>
      </form>
    </div>
  );
}
