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

  static async updateFileMetadata(fileKey: string, newFileName: string, newFileType: string, newFileSize: string) {
    return await this.prisma.file.update({
      where: { key: fileKey }, 
      data: {
        fileName: newFileName,
        fileType: newFileType,
        fileSize: newFileSize,
      },
    });
  }
}

class FileController {
  static async handleRequest(req: NextRequest) {
    if (req.method === 'POST') {
      return this.handlePostRequest(req);
    } else if (req.method === 'PUT') {
      return this.handlePutRequest(req);
    } else {
      return FileController.createJsonResponse({ error: 'Método não permitido' }, 405);
    }
  }

  static async handlePostRequest(req: NextRequest) {
    const formData = await req.formData();
    const files = formData.getAll('files') as Blob[];
    const fileNames = formData.getAll('fileNames') as string[];
    const fileTypes = formData.getAll('fileTypes') as string[];
    const fileSizes = formData.getAll('fileSizes') as string[];

    const user = await currentUser();

    if (!files.length || !user || !user.id) {
      return FileController.createJsonResponse({ error: 'Usuário não autenticado ou nenhum arquivo enviado' }, 400);
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

        await FileService.uploadFileToS3(newKey, fileContentBuffer, newFileType);

        const savedFile = await FileService.saveFileMetadata(
          user.id,
          newKey,
          newFileName,
          newFileType,
          newFileSize
        );

        uploadedFiles.push(savedFile);
      }

      return FileController.createJsonResponse({
        message: 'Arquivos carregados e metadados salvos com sucesso',
        uploadedFiles,
      });
    } catch (error) {
      console.error('Erro ao carregar arquivos ou salvar metadados:', error);
      return FileController.createJsonResponse({ error: 'Falha ao carregar arquivos ou salvar metadados' }, 500);
    } finally {
      await FileService.prisma.$disconnect();
    }
  }

  static async handlePutRequest(req: NextRequest) {
    const formData = await req.formData();
    const fileKey = formData.get('fileKey') as string;
    const newFileName = formData.get('newFileName') as string;
    const newFileType = formData.get('newFileType') as string;
    const newFileSize = formData.get('newFileSize') as string;
    const file = formData.get('file') as Blob;

    const user = await currentUser();

    if (!fileKey || !newFileName || !file || !user || !user.id) {
      return FileController.createJsonResponse({ error: 'Dados insuficientes ou usuário não autenticado' }, 400);
    }

    const existingFile = await FileService.prisma.file.findUnique({
      where: { key: fileKey },
    });

    if (!existingFile) {
      return FileController.createJsonResponse({ error: 'Arquivo não encontrado' }, 404);
    }

    try {
      const fileContentBuffer = Buffer.from(await file.arrayBuffer());

      await FileService.uploadFileToS3(fileKey, fileContentBuffer, newFileType);

      const updatedFile = await FileService.updateFileMetadata(fileKey, newFileName, newFileType, newFileSize);

      return FileController.createJsonResponse({
        message: 'Arquivo atualizado com sucesso',
        updatedFile,
      });
    } catch (error) {
      console.error('Erro ao atualizar o arquivo ou metadados:', error);
      return FileController.createJsonResponse({ error: 'Falha ao atualizar o arquivo ou metadados' }, 500);
    } finally {
      await FileService.prisma.$disconnect();
    }
  }

  static createJsonResponse(data: any, status: number = 200) {
    return NextResponse.json(data, { status });
  }
}

export async function POST(req: NextRequest) {
  return await FileController.handleRequest(req);
}

export async function PUT(req: NextRequest) {
  return await FileController.handleRequest(req);
}
