import { currentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { s3Client } from '../s3client-config';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

class FileService {
  static prisma = new PrismaClient();

  static async uploadFileToS3(
    newKey: string,
    fileContent: Buffer,
    newFileType: string
  ) {
    const uploadParams = {
      Bucket: process.env.BUCKET_S3!,
      Key: newKey,
      Body: fileContent,
      ContentType: newFileType,
    };

    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
    } catch (error) {
      console.error('Erro durante o upload para S3:', error);
      throw new Error('Falha ao enviar o arquivo para o S3');
    }
  }

  static generateNewKey(userId: string, fileType: string) {
    const extension = fileType.split('/')[1];
    const newKey = `${userId}/${randomUUID()}.${extension}`;
    return newKey;
  }

  static async saveFileMetadata(
    userId: string,
    key: string,
    fileName: string,
    fileType: string,
    fileSize: string,
    containerId: string
  ) {
    try {
      const result = await this.prisma.file.create({
        data: {
          userId,
          key,
          fileName,
          fileType,
          fileSize,
          containerId,
        },
      });
      return result;
    } catch (error) {
      console.error('Erro ao salvar metadados no banco de dados:', error);
      throw new Error('Falha ao salvar metadados do arquivo');
    }
  }

  static async updateFileMetadata(fileKey: string, updates: any) {
    try {
      const result = await this.prisma.file.update({
        where: { key: fileKey },
        data: updates,
      });
      return result;
    } catch (error) {
      console.error('Erro ao atualizar metadados no banco de dados:', error);
      throw new Error('Falha ao atualizar metadados do arquivo');
    }
  }
}

class FileController {
  static async handleRequest(req: NextRequest) {
    if (req.method === 'PUT') {
      return this.handlePutRequest(req);
    } else {
      return FileController.createJsonResponse(
        { error: 'Método não permitido' },
        405
      );
    }
  }

  static async handlePutRequest(req: NextRequest) {
    const formData = await req.formData();
    const fileKey = formData.get('fileKey') as string;
    const newFileName = formData.get('newFileName') as string | null;
    const newFileType = formData.get('newFileType') as string | null;
    const newFileSize = formData.get('newFileSize') as string | null;
    const file = formData.get('file') as Blob | null;
    const containerId = formData.get('containerId') as string | null;

    const user = await currentUser();

    if (!fileKey || !user || !user.id) {
      return FileController.createJsonResponse(
        { error: 'Dados insuficientes ou usuário não autenticado' },
        400
      );
    }

    const existingFile = await FileService.prisma.file.findUnique({
      where: { key: fileKey },
    });

    if (!existingFile) {
      return FileController.createJsonResponse(
        { error: 'Arquivo não encontrado' },
        404
      );
    }

    try {
      const updates: any = {};

      if (newFileName && newFileName !== existingFile.fileName) {
        updates.fileName = newFileName;
      }
      if (containerId && containerId !== existingFile.containerId) {
        updates.containerId = containerId;
      }

      if (file && newFileType && newFileSize) {
        const fileContentBuffer = Buffer.from(await file.arrayBuffer());

        await FileService.uploadFileToS3(
          fileKey,
          fileContentBuffer,
          newFileType
        );

        updates.fileType = newFileType;
        updates.fileSize = newFileSize;
      }

      const updatedFile = await FileService.updateFileMetadata(
        fileKey,
        updates
      );

      return FileController.createJsonResponse({
        message: 'Arquivo atualizado com sucesso',
        updatedFile,
      });
    } catch (error) {
      console.error('Erro ao atualizar o arquivo ou metadados:', error);
      return FileController.createJsonResponse(
        { error: 'Falha ao atualizar o arquivo ou metadados' },
        500
      );
    } finally {
      await FileService.prisma.$disconnect();
    }
  }

  static createJsonResponse(data: any, status: number = 200) {
    return NextResponse.json(data, { status });
  }
}

export async function PUT(req: NextRequest) {
  return await FileController.handleRequest(req);
}
