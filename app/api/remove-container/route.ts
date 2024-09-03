import { DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { s3Client } from '../s3client-config';

class ContainerService {
  static prisma = new PrismaClient();

  static async findContainerByIdAndUser(containerId: string, userId: string) {
    return await this.prisma.container.findFirst({
      where: {
        id: containerId,
        userId,
      },
      include: {
        files: true,
      },
    });
  }

  static async deleteContainerAndFiles(containerId: string) {
    return await this.prisma.$transaction([
      this.prisma.file.deleteMany({
        where: {
          containerId,
        },
      }),
      this.prisma.container.delete({
        where: {
          id: containerId,
        },
      }),
    ]);
  }

  static async deleteFilesFromS3(prefix: string) {
    const listParams = {
      Bucket: process.env.BUCKET_S3!,
      Prefix: prefix,
    };

    const listCommand = new ListObjectsV2Command(listParams);
    const listedObjects = await s3Client.send(listCommand);

    if (listedObjects.Contents?.length) {
      const validKeys = listedObjects.Contents.map(({ Key }) => Key).filter(
        (key) => key !== undefined && key !== null
      );

      if (validKeys.length > 0) {
        const deleteParams = {
          Bucket: process.env.BUCKET_S3!,
          Delete: {
            Objects: validKeys.map((Key) => ({ Key })),
          },
        };

        const deleteCommand = new DeleteObjectsCommand(deleteParams);
        await s3Client.send(deleteCommand);
      }
    }
  }

  static async deleteS3Folder(prefix: string) {
    await this.deleteFilesFromS3(prefix);

    // Deletar a pasta em si (que é representada pelo prefixo)
    const deleteParams = {
      Bucket: process.env.BUCKET_S3!,
      Delete: {
        Objects: [{ Key: prefix }],
      },
    };

    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    await s3Client.send(deleteCommand);
  }
}

class ContainerController {
  static async handleRequest(req: NextRequest) {
    const { containerId } = await req.json();

    if (!containerId) {
      return this.createJsonResponse(
        {
          error: 'O ID do container é obrigatório e deve ser uma string',
        },
        400
      );
    }

    const user = await currentUser();

    if (!user || !user.id) {
      return this.createJsonResponse({ error: 'Usuário não autenticado' }, 401);
    }

    try {
      const container = await ContainerService.findContainerByIdAndUser(
        containerId,
        user.id
      );

      if (!container) {
        return this.createJsonResponse(
          { error: 'Container não encontrado ou não pertence ao usuário' },
          404
        );
      }

      const prefix = `${user.id}/${containerId}/`;

      // Deletar arquivos dentro da pasta e depois a pasta
      await ContainerService.deleteS3Folder(prefix);
      await ContainerService.deleteContainerAndFiles(containerId);

      return this.createJsonResponse({
        message: 'Container e arquivos deletados com sucesso',
      });
    } catch (error) {
      console.error('Erro ao deletar container e arquivos:', error);
      return this.createJsonResponse(
        { error: 'Falha ao deletar container e arquivos' },
        500
      );
    } finally {
      await ContainerService.prisma.$disconnect();
    }
  }

  static createJsonResponse(data: any, status: number = 200) {
    return NextResponse.json(data, { status });
  }
}

export async function POST(req: NextRequest) {
  return await ContainerController.handleRequest(req);
}
