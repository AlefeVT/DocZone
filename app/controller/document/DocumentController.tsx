import { FileData } from '@/interfaces/FileData';

export class DocumentController {
  static filterFiles(files: FileData[], searchTerm: string): FileData[] {
    return files.filter((file) =>
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  static filterFilesByContainerAndSearchTerm(
    files: FileData[],
    containerId: string,
    searchTerm: string
  ): FileData[] {
    let filteredFiles = files;

    if (containerId) {
      filteredFiles = filteredFiles.filter(
        (file) => file.containerId === containerId
      );
    }

    if (searchTerm) {
      filteredFiles = this.filterFiles(filteredFiles, searchTerm);
    }

    return filteredFiles;
  }

  static async fetchFiles(DocumentService: any): Promise<FileData[]> {
    return await DocumentService.fetchFiles();
  }
}
