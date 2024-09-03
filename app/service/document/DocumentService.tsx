import { FileData } from '@/interfaces/FileData';
import axios from 'axios';

export class DocumentService {
  static async fetchFiles(): Promise<FileData[]> {
    try {
      const { data } = await axios.get(`/api/get-documents`);
      return data.files || [];
    } catch (error) {
      console.error('Erro ao buscar dados do arquivo (service):', error);
      return [];
    }
  }

  static filterFiles(files: FileData[], searchTerm: string): FileData[] {
    return files.filter((file) =>
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}
