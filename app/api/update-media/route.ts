import { currentUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { s3Client } from '../s3client-config';
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

class FileService {
  static prisma = new PrismaClient();

  static async findFileByKeyAndUser(fileKey: string, userId: string) {
    return await this.prisma.file.findFirst({
      where: {
        key: fileKey,
        userId,
      },
    });
  }

  static async updateFileMetadata(
    fileId: string,
    newKey: string,
    newFileName: string,
    newFileType: string
  ) {
    return await this.prisma.file.update({
      where: {
        id: fileId,
      },
      data: {
        key: newKey,
        fileName: newFileName,
        fileType: newFileType,
      },
    });
  }

  static async copyFileInS3(
    fileKey: string,
    newKey: string,
    newFileType: string
  ) {
    const copyParams = {
      Bucket: process.env.BUCKET_S3!,
      CopySource: `${process.env.BUCKET_S3!}/${fileKey}`,
      Key: newKey,
      ContentType: newFileType,
    };
    await s3Client.send(new CopyObjectCommand(copyParams));
  }

  static async deleteFileFromS3(fileKey: string) {
    const deleteParams = {
      Bucket: process.env.BUCKET_S3!,
      Key: fileKey,
    };
    await s3Client.send(new DeleteObjectCommand(deleteParams));
  }

  static generateNewKey(userId: string, fileType: string) {
    const extension = fileType.split('/')[1];
    return `${userId}/${randomUUID()}.${extension}`;
  }
}

class FileController {
  static async handleRequest(req: NextRequest) {
    const { fileKey, newFileName, newFileType } = this.getQueryParams(req);
    const user = await currentUser();

    if (!fileKey || !fileKey) {
      return this.createJsonResponse(
        { error: 'fileKey is required and must be a string' },
        400
      );
    }

    if (!newFileName && !newFileType) {
      return this.createJsonResponse(
        {
          error: 'At least one of newFileName or newFileType must be provided',
        },
        400
      );
    }

    if (!user || !user.id) {
      return this.createJsonResponse({ error: 'User not authenticated' }, 401);
    }

    try {
      const file = await FileService.findFileByKeyAndUser(fileKey, user.id);

      if (!file) {
        return this.createJsonResponse(
          { error: 'File not found or does not belong to the user' },
          404
        );
      }

      const newKey = newFileName
        ? FileService.generateNewKey(user.id, newFileType || file.fileType)
        : fileKey;

      if (newKey !== fileKey) {
        await FileService.copyFileInS3(
          fileKey,
          newKey,
          newFileType || file.fileType
        );
        await FileService.deleteFileFromS3(fileKey);
      }

      const updatedFile = await FileService.updateFileMetadata(
        file.id,
        newKey,
        newFileName || file.fileName,
        newFileType || file.fileType
      );

      return this.createJsonResponse({
        message: 'File metadata and S3 object updated successfully',
        updatedFile,
      });
    } catch (error) {
      console.error('Error updating file metadata or S3 object:', error);
      return this.createJsonResponse(
        { error: 'Failed to update file metadata or S3 object' },
        500
      );
    } finally {
      await FileService.prisma.$disconnect();
    }
  }

  static getQueryParams(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const fileKey = searchParams.get('fileKey');
    const newFileName = searchParams.get('newFileName');
    const newFileType = searchParams.get('newFileType');
    return { fileKey, newFileName, newFileType };
  }

  static createJsonResponse(data: any, status: number = 200) {
    return NextResponse.json(data, { status });
  }
}

export async function PUT(req: NextRequest) {
  return await FileController.handleRequest(req);
}
