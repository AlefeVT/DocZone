import axios from 'axios';
import { toast } from 'sonner';
import { fileUploadSchema } from '@/schemas';

export class DocumentCreateService {
  static validateFileUpload(data: {
    customFileName: string;
    selectedFiles: File[]; // Alterado para lidar com múltiplos arquivos
  }) {
    const errors: {
      customFileName?: string;
      selectedFile?: string;
    } = {};

    // Valida o nome do arquivo customizado
    const fileNameValidation = fileUploadSchema.shape.customFileName.safeParse(data.customFileName);
    if (!fileNameValidation.success) {
      errors.customFileName = fileNameValidation.error.format()._errors[0];
    }

    // Valida cada arquivo individualmente
    if (data.selectedFiles.length === 0) {
      errors.selectedFile = 'Pelo menos um arquivo deve ser selecionado';
    } else {
      data.selectedFiles.forEach((file) => {
        const fileValidation = fileUploadSchema.shape.selectedFile.safeParse(file);
        if (!fileValidation.success) {
          errors.selectedFile = fileValidation.error.format()._errors[0];
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return { success: true, errors: {} };
  }

  static async uploadToS3(
    file: File,
    customFileName: string | null
  ): Promise<string | null> {
    try {
      if (!file) {
        toast(
          'Nenhum documento selecionado ou o documento selecionado é inválido'
        );
        return null;
      }

      const fileName = encodeURIComponent(customFileName || file.name);
      const fileType = encodeURIComponent(file.type);
      const fileSize = encodeURIComponent(file.size);

      const { data } = await axios.get(
        `/api/media?fileType=${fileType}&fileName=${fileName}&fileSize=${fileSize}`
      );
      const { uploadUrl, key } = data;

      await axios.put(uploadUrl, file);

      return key;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast('Failed to upload file');
      return null;
    }
  }

  static generateFileUrl(key: string): string {
    return `/api/file-access-url?key=${encodeURIComponent(key)}`;
  }
}
