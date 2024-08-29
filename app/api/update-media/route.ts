import { currentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { s3Client } from '../s3client-config';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

class FileService {
  static prisma = new PrismaClient();

  static async uploadFileToS3(newKey: string, fileContent: Buffer, newFileType: string) {
    const uploadParams = {
      Bucket: process.env.BUCKET_S3!,
      Key: newKey,
      Body: fileContent,
      ContentType: newFileType,
    };
    await s3Client.send(new PutObjectCommand(uploadParams));
  }

  static generateNewKey(userId: string, fileType: string) {
    const extension = fileType.split('/')[1];
    return `${userId}/${randomUUID()}.${extension}`;
  }

  static async saveFileMetadata(userId: string, key: string, fileName: string, fileType: string, fileSize: string) {
    return await this.prisma.file.create({
      data: {
        userId,
        key,
        fileName,
        fileType,
        fileSize,
      },
    });
  }
}

class FileController {
  static async handleRequest(req: NextRequest) {
    const formData = await req.formData();
    const files = formData.getAll('files') as Blob[];
    const fileNames = formData.getAll('fileNames') as string[];
    const fileTypes = formData.getAll('fileTypes') as string[];
    const fileSizes = formData.getAll('fileSizes') as string[];

    const user = await currentUser();

    if (!files.length || !user || !user.id) {
      return this.createJsonResponse({ error: 'Usuário não autenticado ou nenhum arquivo enviado' }, 400);
    }

    try {
      const uploadedFiles = [];

      for (let i = 0; i < files.length; i++) {
        const newFileContent = files[i];
        const newFileName = fileNames[i];
        const newFileType = fileTypes[i];
        const newFileSize = fileSizes[i];

        const newKey = FileService.generateNewKey(user.id, newFileType);
        const fileContentBuffer = Buffer.from(await newFileContent.arrayBuffer());

        // Upload para o S3
        await FileService.uploadFileToS3(newKey, fileContentBuffer, newFileType);

        // Salva os metadados no banco de dados
        const savedFile = await FileService.saveFileMetadata(
          user.id,
          newKey,
          newFileName,
          newFileType,
          newFileSize
        );

        uploadedFiles.push(savedFile);
      }

      return this.createJsonResponse({
        message: 'Arquivos carregados e metadados salvos com sucesso',
        uploadedFiles,
      });
    } catch (error) {
      console.error('Erro ao carregar arquivos ou salvar metadados:', error);
      return this.createJsonResponse({ error: 'Falha ao carregar arquivos ou salvar metadados' }, 500);
    } finally {
      await FileService.prisma.$disconnect();
    }
  }

  static createJsonResponse(data: any, status: number = 200) {
    return NextResponse.json(data, { status });
  }
}

export async function POST(req: NextRequest) { // Altere para POST para o upload de arquivos
  return await FileController.handleRequest(req);
}
