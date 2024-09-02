import { FormEvent } from 'react';
import { DocumentCreateService } from '@/app/service/document/DocumentCreateService';

export class DocumentCreateController {
  static async handleSubmit(
    e: FormEvent<HTMLFormElement>,
    selectedFiles: File[],
    selectedContainer: string,
    setIsLoading: (loading: boolean) => void,
    onSuccess: (fileUrls: string[]) => void,
    onError: (errors: {
      selectedFile?: string;
      selectedContainer?: string;
    }) => void
  ) {
    e.preventDefault();
    setIsLoading(true);

    const validationResult = DocumentCreateService.validateFileUpload({
      selectedFiles,
      selectedContainer,
    });

    if (!validationResult.success) {
      onError(validationResult.errors);
      setIsLoading(false);
      return;
    }

    try {
      const fileUrls: string[] = [];

      for (const file of selectedFiles) {
        const key = await DocumentCreateService.uploadToS3(
          file,
          selectedContainer
        );
        if (key) {
          const fileUrl = DocumentCreateService.generateFileUrl(key);
          fileUrls.push(fileUrl);
        }
      }

      if (fileUrls.length > 0) {
        onSuccess(fileUrls);
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      onError({ selectedFile: 'Erro ao carregar arquivos. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  }

  static handleRemoveFile(
    index: number,
    selectedFiles: File[],
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
