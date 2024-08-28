import { FormEvent } from 'react';
import { DocumentCreateService } from '@/app/service/document/DocumentCreateService';

export class DocumentCreateController {
  static async handleSubmit(
    e: FormEvent<HTMLFormElement>,
    customFileName: string,
    selectedFile: File | null,
    setIsLoading: (loading: boolean) => void,
    onSuccess: (fileUrl: string) => void,
    onError: (errors: {
      customFileName?: string;
      selectedFile?: string;
    }) => void
  ) {
    e.preventDefault();
    setIsLoading(true);

    const validationResult = DocumentCreateService.validateFileUpload({
      customFileName,
      selectedFile,
    });

    if (!validationResult.success) {
      onError(validationResult.errors);
      setIsLoading(false);
      return;
    }

    try {
      const key = await DocumentCreateService.uploadToS3(
        selectedFile,
        customFileName
      );
      if (key) {
        const newFileUrl = DocumentCreateService.generateFileUrl(key);
        onSuccess(newFileUrl);
      }
    } finally {
      setIsLoading(false);
    }
  }

  static handleFileChange(
    file: File | null,
    onFileChange: (file: File | null) => void,
    clearError: () => void
  ) {
    onFileChange(file);
    clearError();
  }

  static handleRemoveFile(
    onFileRemove: () => void,
    setError: (message: string) => void
  ) {
    onFileRemove();
    setError('Um documento válido deve ser selecionado');
  }
}
