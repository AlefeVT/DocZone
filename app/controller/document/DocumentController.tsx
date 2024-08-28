import { FileData } from '@/interfaces/FileData';

export class DocumentListController {
  static filterFiles(files: FileData[], searchTerm: string): FileData[] {
    return files.filter((file) =>
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  static async fetchFiles(DocumentService: any): Promise<FileData[]> {
    return await DocumentService.fetchFiles();
  }
}
