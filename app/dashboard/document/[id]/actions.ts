import { PrismaClient } from '@prisma/client';

export default async function getDocumentEdit(id: string) {
  try {
    const prisma = new PrismaClient();

    const document = await prisma.file.findUnique({
      where: {
        id,
      },
      include: {
        container: true, // Inclui os dados do container relacionado, se necessário
        user: true, // Inclui os dados do usuário relacionado, se necessário
        signatures: true, // Inclui as assinaturas relacionadas
      },
    });

    if (!document) {
      throw new Error(`Documento com id ${id} não encontrado`);
    }

    return {
      id: document.id,
      containerId: document.containerId,
      userId: document.userId,
      key: document.key,
      fileName: document.fileName,
      fileSize: document.fileSize,
      fileType: document.fileType,
      createdAt: document.createdAt,
      container: document.container,
      user: document.user,
      signatures: document.signatures,
    };
  } catch (error) {
    console.error('Erro ao buscar os dados do documento:', error);
    throw error;
  }
}
