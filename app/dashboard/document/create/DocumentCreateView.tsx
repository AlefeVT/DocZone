'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import FileUploadDropzone from './_components/fileUploadDropzone';
import SelectedFileCard from './_components/selectedFileCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/SubmitButtons';
import { DocumentCreateController } from '../../../controller/document/DocumentCreateController';
import { useRouter } from 'next/navigation';

export default function DocumentCreateView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState<string>('');
  const [errors, setErrors] = useState<{
    customFileName?: string;
    selectedFile?: string;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSuccess = () => {
    setSelectedFile(null);
    setCustomFileName('');
    setErrors({});
    router.push('/dashboard/document');
  };

  const handleError = (errors: {
    customFileName?: string;
    selectedFile?: string;
  }) => {
    setErrors(errors);
  };

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

      <form
        onSubmit={(e) =>
          DocumentCreateController.handleSubmit(
            e,
            customFileName,
            selectedFile,
            setIsLoading,
            handleSuccess,
            handleError
          )
        }
        className="w-full space-y-4"
      >
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
              if (errors.customFileName) {
                setErrors({ ...errors, customFileName: undefined });
              }
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
            <FileUploadDropzone
              onFileChange={(e) =>
                DocumentCreateController.handleFileChange(
                  e.target.files?.[0] || null,
                  setSelectedFile,
                  () =>
                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      selectedFile: undefined,
                    }))
                )
              }
            />
            {errors.selectedFile && (
              <p className="text-red-500">{errors.selectedFile}</p>
            )}
          </>
        ) : (
          <SelectedFileCard
            fileName={selectedFile.name}
            fileSize={selectedFile.size}
            onRemove={() =>
              DocumentCreateController.handleRemoveFile(
                () => setSelectedFile(null),
                (message) =>
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    selectedFile: message,
                  }))
              )
            }
          />
        )}

        <div className="flex justify-end">
          <SubmitButton text="Carregar" isLoading={isLoading} />
        </div>
      </form>
    </div>
  );
}
