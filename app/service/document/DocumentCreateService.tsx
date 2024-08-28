import axios from 'axios';
import { toast } from 'sonner';
import { fileUploadSchema } from '@/schemas';

export class DocumentCreateService {
  static validateFileUpload(data: {
    customFileName: string;
    selectedFile: File | null;
  }) {
    const validationResult = fileUploadSchema.safeParse(data);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      return {
        success: false,
        errors: {
          customFileName: formattedErrors.customFileName?._errors[0],
          selectedFile: formattedErrors.selectedFile?._errors[0],
        },
      };
    }
    return { success: true, errors: {} };
  }

  static async uploadToS3(
    file: File | null,
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

      const { data } = await axios.get(
        `/api/media?fileType=${fileType}&fileName=${fileName}`
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
