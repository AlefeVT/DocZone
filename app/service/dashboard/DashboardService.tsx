import { PrismaClient } from '@prisma/client';

export default class DashboardService {
  async getDashboardInfo() {
    const prisma = new PrismaClient();
    const totalDocuments = await prisma.file.count();
    const totalContainers = await prisma.container.count();
    const totalStorageUsed = await this.calculateTotalStorageUsed();

    const documentsPerContainer = await this.getDocumentsPerContainer();
    const documentCreationOverTime = await this.getDocumentCreationOverTime();

    return {
      totalDocuments,
      totalContainers,
      totalStorageUsed,
      documentsPerContainer, // Gráfico de distribuição de documentos por caixa
      documentCreationOverTime, // Gráfico de criação de documentos ao longo do tempo
    };
  }

  private async calculateTotalStorageUsed(): Promise<string> {
    const prisma = new PrismaClient();
    const files = await prisma.file.findMany({
      select: {
        fileSize: true,
      },
    });

    const totalSizeInBytes = files.reduce((total, file) => {
      const fileSizeInBytes = parseFloat(file.fileSize) || 0;
      return total + fileSizeInBytes;
    }, 0);

    return this.formatBytes(totalSizeInBytes);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${size} ${sizes[i]}`;
  }

  // Função para obter a quantidade de documentos por caixa
  private async getDocumentsPerContainer() {
    const prisma = new PrismaClient();

    const documentsByContainer = await prisma.container.findMany({
      select: {
        name: true,
        _count: {
          select: { files: true },
        },
      },
    });

    return documentsByContainer.map((container) => ({
      name: container.name,
      documentos: container._count.files,
    }));
  }

  // Função para obter o número de arquivos criados ao longo do tempo
  private async getDocumentCreationOverTime() {
    const prisma = new PrismaClient();

    const documentsCreatedOverTime = await prisma.file.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
    });

    return documentsCreatedOverTime.map((entry) => ({
      data: entry.createdAt.toISOString().slice(0, 10),
      quantidade: entry._count.id,
    }));
  }
}
