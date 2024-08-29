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

export function DocumentEditForm({ data }: DocumentData) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState<string>(
    data.fileName || ''
  );
  const [errors, setErrors] = useState<{
    customFileName?: string;
    selectedFile?: string;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!data.key || !customFileName) {
        throw new Error('fileKey e newFileName são obrigatórios');
      }

      const formData = new FormData();
      formData.append('fileKey', data.key);
      formData.append('newFileName', customFileName);

      if (selectedFile) {
        formData.append('newFileType', selectedFile.type);
        formData.append('newFileSize', selectedFile.size.toString());
        formData.append('file', selectedFile); 
      } else {
        throw new Error('Nenhum arquivo foi selecionado para upload.');
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
          <SubmitButton text="Carregar" isLoading={isLoading} />
        </div>
      </form>
    </div>
  );
}
