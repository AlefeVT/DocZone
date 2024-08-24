'use client';

import axios from 'axios';
import { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import FileUploadDropzone from './_components/fileUploadDropzone';
import SelectedFileCard from './_components/selectedFileCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fileUploadSchema } from '@/schemas';
import { SubmitButton } from '@/components/SubmitButtons';
import { useRouter } from 'next/navigation';

async function uploadToS3(file: File | null, customFileName: string | null) {
  try {
    if (!file) {
      toast(
        'Nenhum documento selecionado ou o documento selecionado é inválido'
      );
      return null;
    }

    const fileName = encodeURIComponent(customFileName || file.name);
    const fileType = encodeURIComponent(file.type);

    const { data } = await axios.get(
      `/api/media?fileType=${fileType}&fileName=${fileName}`
    );
    const { uploadUrl, key } = data;

    await axios.put(uploadUrl, file);

    return key;
  } catch (error) {
    console.error('Error uploading file:', error);
    toast('Failed to upload file');
  }
}

export default function DocumentCreateRoute() {
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState<string>('');
  const [errors, setErrors] = useState<{
    customFileName?: string;
    selectedFile?: string;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  async function handleSubmit(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const validationResult = fileUploadSchema.safeParse({
      customFileName,
      selectedFile,
    });

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      setErrors({
        customFileName: formattedErrors.customFileName?._errors[0],
        selectedFile: formattedErrors.selectedFile?._errors[0],
      });
      toast('Por favor, corrija os erros no formulário');
      setIsLoading(false);
      return;
    }

    const key = await uploadToS3(selectedFile, customFileName);

    if (key) {
      const newFileUrl = `/api/file-access-url?key=${encodeURIComponent(key)}`;
      setFileUrls((prevUrls) => [...prevUrls, newFileUrl]);
      toast('Documento carregado com sucesso!');

      // Limpar o formulário
      setSelectedFile(null);
      setCustomFileName('');
      setErrors({});

      router.push('/dashboard/document');
    }
    setIsLoading(false);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    setErrors((prevErrors) => ({ ...prevErrors, selectedFile: undefined }));
  }

  function handleRemoveFile() {
    setSelectedFile(null);
    setErrors((prevErrors) => ({
      ...prevErrors,
      selectedFile: 'Um documento válido deve ser selecionado',
    }));
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full flex items-center mb-10 gap-8">
        <Button variant={'outline'} size={'icon'} asChild>
          <Link href={'/dashboard/document'}>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">Carregar Documentos</h2>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
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
