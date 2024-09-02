import axios from 'axios';
import { toast } from 'sonner';

export class DocumentCreateService {
  static validateFileUpload(data: {
    selectedFiles: File[];
    selectedContainer: string;
  }) {
    const errors: {
      selectedFile?: string;
      selectedContainer?: string;
    } = {};

    if (data.selectedFiles.length === 0) {
      errors.selectedFile = 'Pelo menos um arquivo deve ser selecionado';
    }

    if (!data.selectedContainer) {
      errors.selectedContainer = 'Por favor, selecione uma caixa';
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
    selectedContainer: string
  ): Promise<string | null> {
    try {
      if (!file) {
        toast(
          'Nenhum documento selecionado ou o documento selecionado é inválido'
        );
        return null;
      }

      const fileName = encodeURIComponent(file.name);
      const fileType = encodeURIComponent(file.type);
      const fileSize = encodeURIComponent(file.size);

      const { data } = await axios.get(
        `/api/media?fileType=${fileType}&fileName=${fileName}&fileSize=${fileSize}&containerId=${selectedContainer}`
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
