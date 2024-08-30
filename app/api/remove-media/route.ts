import { currentUser } from '@/lib/auth';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { s3Client } from '../s3client-config';
import { PrismaClient } from '@prisma/client';

class FileService {
  static prisma = new PrismaClient();

  // Encontra arquivos por IDs e ID do usuário
  static async findFilesByIdsAndUser(fileIds: string[], userId: string) {
    return await this.prisma.file.findMany({
      where: {
        id: { in: fileIds },
        userId,
      },
    });
  }

  // Deleta os registros dos arquivos no banco de dados
  static async deleteFileRecords(fileIds: string[]) {
    return await this.prisma.file.deleteMany({
      where: {
        id: { in: fileIds },
      },
    });
  }

  // Deleta os arquivos do S3
  static async deleteFilesFromS3(fileKeys: string[]) {
    const deletePromises = fileKeys.map((fileKey) => {
      const s3Params = {
        Bucket: process.env.BUCKET_S3!,
        Key: fileKey,
      };
      const command = new DeleteObjectCommand(s3Params);
      return s3Client.send(command);
    });

    await Promise.all(deletePromises);
  }
}

class FileController {
  static async handleRequest(req: NextRequest) {
    const fileIds = await this.getFileIdsFromRequest(req);

    if (!fileIds || fileIds.length === 0) {
      return this.createJsonResponse(
        { error: 'Os IDs dos arquivos são obrigatórios e devem ser um array não vazio' },
        400
      );
    }

    const user = await currentUser();

    if (!user || !user.id) {
      return this.createJsonResponse({ error: 'Usuário não autenticado' }, 401);
    }

    try {
      // Encontrar arquivos que pertencem ao usuário atual
      const files = await FileService.findFilesByIdsAndUser(fileIds, user.id);

      if (files.length === 0) {
        return this.createJsonResponse(
          { error: 'Arquivos não encontrados ou não pertencem ao usuário' },
          404
        );
      }

      const fileKeys = files.map((file) => file.key);

      // Deletar arquivos do S3
      await FileService.deleteFilesFromS3(fileKeys);

      // Deletar registros dos arquivos no banco de dados
      await FileService.deleteFileRecords(fileIds);

      return this.createJsonResponse({ message: 'Arquivos deletados com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar arquivos do S3 ou do banco de dados:', error);
      return this.createJsonResponse(
        { error: 'Falha ao deletar arquivos do S3 ou do banco de dados' },
        500
      );
    } finally {
      await FileService.prisma.$disconnect();
    }
  }

  // Extrai os IDs dos arquivos do corpo da requisição
  static async getFileIdsFromRequest(req: NextRequest): Promise<string[] | null> {
    try {
      const body = await req.json();
      return body.fileIds || null;
    } catch (error) {
      console.error('Falha ao analisar o corpo da requisição:', error);
      return null;
    }
  }

  // Cria uma resposta JSON
  static createJsonResponse(data: any, status: number = 200) {
    return NextResponse.json(data, { status });
  }
}

export async function POST(req: NextRequest) {
  return await FileController.handleRequest(req);
}
