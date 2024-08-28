import { FileData } from '@/interfaces/FileData';
import axios from 'axios';

export class DocumentService {
  static async fetchFiles(): Promise<FileData[]> {
    try {
      const { data } = await axios.get(`/api/file-access-url`);
      return data.files || [];
    } catch (error) {
      console.error('Error fetching file data:', error);
      return [];
    }
  }

  static filterFiles(files: FileData[], searchTerm: string): FileData[] {
    return files.filter((file) =>
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}
