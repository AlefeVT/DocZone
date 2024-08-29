import { FormEvent } from 'react';
import { DocumentCreateService } from '@/app/service/document/DocumentCreateService';

export class DocumentCreateController {
  static async handleSubmit(
    e: FormEvent<HTMLFormElement>,
    customFileName: string,
    selectedFiles: File[],  // Agora lidamos com uma lista de arquivos
    setIsLoading: (loading: boolean) => void,
    onSuccess: (fileUrls: string[]) => void, // O onSuccess agora aceita uma lista de URLs
    onError: (errors: {
      customFileName?: string;
      selectedFile?: string;
    }) => void
  ) {
    e.preventDefault();
    setIsLoading(true);

    const validationResult = DocumentCreateService.validateFileUpload({
      customFileName,
      selectedFiles,  // Passa a lista de arquivos para a validação
    });

    if (!validationResult.success) {
      onError(validationResult.errors);
      setIsLoading(false);
      return;
    }

    try {
      const fileUrls: string[] = [];

      for (const file of selectedFiles) {
        const key = await DocumentCreateService.uploadToS3(file, customFileName);
        if (key) {
          const fileUrl = DocumentCreateService.generateFileUrl(key);
          fileUrls.push(fileUrl);
        }
      }

      if (fileUrls.length > 0) {
        onSuccess(fileUrls); // Passa a lista de URLs ao invés de uma única URL
      }
    } finally {
      setIsLoading(false);
    }
  }

  static handleFileChange(
    files: File[],  // Agora lidamos com múltiplos arquivos
    onFileChange: (files: File[]) => void,
    clearError: () => void
  ) {
    onFileChange(files);
    clearError();
  }

  static handleRemoveFile(
    index: number,
    selectedFiles: File[],  // Passa a lista de arquivos atualmente selecionados
    onFileChange: (files: File[]) => void,
    setError: (message: string) => void
  ) {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    onFileChange(updatedFiles);
    if (updatedFiles.length === 0) {
      setError('Um documento válido deve ser selecionado');
    }
  }
}
