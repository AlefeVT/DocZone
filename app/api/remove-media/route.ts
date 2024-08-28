import { currentUser } from '@/lib/auth';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';
import { s3Client } from '../s3client-config';
import { PrismaClient } from '@prisma/client';

class FileService {
  static prisma = new PrismaClient();

  static async findFileByIdAndUser(fileId: string, userId: string) {
    return await this.prisma.file.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });
  }

  static async deleteFileRecord(fileId: string) {
    return await this.prisma.file.delete({
      where: {
        id: fileId,
      },
    });
  }

  static async deleteFileFromS3(fileKey: string) {
    const s3Params = {
      Bucket: process.env.BUCKET_S3!,
      Key: fileKey,
    };
    const command = new DeleteObjectCommand(s3Params);
    await s3Client.send(command);
  }
}

class FileController {
  static async handleRequest(req: NextRequest) {
    const fileId = this.getFileIdFromRequest(req);

    if (!fileId) {
      return this.createJsonResponse(
        { error: 'fileId is required and must be a string' },
        400
      );
    }

    const user = await currentUser();

    if (!user || !user.id) {
      return this.createJsonResponse({ error: 'User not authenticated' }, 401);
    }

    try {
      const file = await FileService.findFileByIdAndUser(fileId, user.id);

      if (!file) {
        return this.createJsonResponse(
          { error: 'File not found or does not belong to the user' },
          404
        );
      }

      await FileService.deleteFileFromS3(file.key);
      await FileService.deleteFileRecord(file.id);

      return this.createJsonResponse({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file from S3 or database:', error);
      return this.createJsonResponse(
        { error: 'Failed to delete file from S3 or database' },
        500
      );
    } finally {
      await FileService.prisma.$disconnect();
    }
  }

  static getFileIdFromRequest(req: NextRequest): string | null {
    const { searchParams } = new URL(req.url);
    return searchParams.get('fileId');
  }

  static createJsonResponse(data: any, status: number = 200) {
    return NextResponse.json(data, { status });
  }
}

export async function DELETE(req: NextRequest) {
  return await FileController.handleRequest(req);
}
