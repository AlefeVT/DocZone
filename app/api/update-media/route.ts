import { currentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { s3Client } from '../s3client-config';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

class FileService {
  static prisma = new PrismaClient();

  static async uploadFileToS3(newKey: string, fileContent: Buffer, newFileType: string) {
    console.log('Iniciando upload para S3');
    console.log(`Chave do arquivo: ${newKey}`);
    console.log(`Tipo de conteúdo: ${newFileType}`);
    console.log(`Tamanho do buffer do arquivo: ${fileContent.length} bytes`);

    const uploadParams = {
      Bucket: process.env.BUCKET_S3!,
      Key: newKey,
      Body: fileContent,
      ContentType: newFileType,
    };

    try {
      await s3Client.send(new PutObjectCommand(uploadParams));
      console.log('Upload para S3 concluído com sucesso');
    } catch (error) {
      console.error('Erro durante o upload para S3:', error);
      throw new Error('Falha ao enviar o arquivo para o S3');
    }
  }

  static generateNewKey(userId: string, fileType: string) {
    const extension = fileType.split('/')[1];
    const newKey = `${userId}/${randomUUID()}.${extension}`;
    console.log(`Nova chave gerada: ${newKey}`);
    return newKey;
  }

  static async saveFileMetadata(userId: string, key: string, fileName: string, fileType: string, fileSize: string, containerId: string) {
    console.log('Salvando metadados do arquivo no banco de dados');
    console.log(`userId: ${userId}, key: ${key}, fileName: ${fileName}, fileType: ${fileType}, fileSize: ${fileSize}, containerId: ${containerId}`);
    
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
      console.log('Metadados salvos com sucesso:', result);
      return result;
    } catch (error) {
      console.error('Erro ao salvar metadados no banco de dados:', error);
      throw new Error('Falha ao salvar metadados do arquivo');
    }
  }

  static async updateFileMetadata(fileKey: string, updates: any) {
    console.log('Atualizando metadados do arquivo');
    console.log(`fileKey: ${fileKey}, updates:`, updates);
    
    try {
      const result = await this.prisma.file.update({
        where: { key: fileKey }, 
        data: updates,
      });
      console.log('Metadados atualizados com sucesso:', result);
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
      return FileController.createJsonResponse({ error: 'Método não permitido' }, 405);
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
      return FileController.createJsonResponse({ error: 'Dados insuficientes ou usuário não autenticado' }, 400);
    }

    const existingFile = await FileService.prisma.file.findUnique({
      where: { key: fileKey },
    });

    if (!existingFile) {
      return FileController.createJsonResponse({ error: 'Arquivo não encontrado' }, 404);
    }

    try {
      console.log('Processando atualização do arquivo');
      const updates: any = {};
      
      if (newFileName && newFileName !== existingFile.fileName) {
        updates.fileName = newFileName;
      }
      if (containerId && containerId !== existingFile.containerId) {
        updates.containerId = containerId;
      }

      if (file && newFileType && newFileSize) {
        const fileContentBuffer = Buffer.from(await file.arrayBuffer());

        console.log(`Tamanho real do buffer do novo arquivo: ${fileContentBuffer.length} bytes`);

        // Enviando o arquivo atualizado para o S3 com a nova chave
        await FileService.uploadFileToS3(fileKey, fileContentBuffer, newFileType);

        updates.fileType = newFileType;
        updates.fileSize = newFileSize;
      }

      // Atualizando os metadados do arquivo
      const updatedFile = await FileService.updateFileMetadata(fileKey, updates);

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

export async function PUT(req: NextRequest) {
  return await FileController.handleRequest(req);
}
