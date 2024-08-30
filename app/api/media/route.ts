import { currentUser } from '@/lib/auth';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { s3Client } from '../s3client-config';
import { PrismaClient } from '@prisma/client';

class FileService {
  static prisma = new PrismaClient();

  static async createFileRecord(
    userId: string,
    containerId: string,
    key: string,
    fileName: string,
    fileSize: string,
    fileType: string
  ) {
    return await this.prisma.file.create({
      data: {
        userId,
        containerId, 
        key,
        fileName,
        fileSize,
        fileType,
      },
    });
  }

  static async generateSignedUrl(key: string, fileType: string) {
    const s3Params = {
      Bucket: process.env.BUCKET_S3!,
      Key: key,
      ContentType: fileType,
    };

    const command = new PutObjectCommand(s3Params);
    return await getSignedUrl(s3Client, command, { expiresIn: 60 });
  }
}

class FileController {
  static async handleRequest(req: NextRequest) {
    const { fileType, fileName, fileSize, containerId } = this.getQueryParams(req);
    const user = await currentUser();

    if (!fileType || !fileName || !fileSize || !containerId) {
      return this.createValidationErrorResponse(
        'fileType, fileName, fileSize, and containerId are required and must be strings'
      );
    }

    if (!user || !user.id) {
      return redirect('/auth/login');
    }

    const key = this.generateFileKey(user.id, containerId, fileType);

    try {
      const uploadUrl = await FileService.generateSignedUrl(key, fileType);
      await FileService.createFileRecord(
        user.id,
        containerId, 
        key,
        fileName,
        fileSize,
        fileType
      );

      return this.createJsonResponse({ uploadUrl, key });
    } catch (error) {
      console.error(
        'Error generating signed URL or saving file metadata:',
        error
      );
      return this.createJsonResponse(
        { error: 'Failed to generate signed URL or save file metadata' },
        500
      );
    }
  }

  static getQueryParams(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const fileType = searchParams.get('fileType');
    const fileName = searchParams.get('fileName');
    const fileSize = searchParams.get('fileSize');
    const containerId = searchParams.get('containerId'); 
    return { fileType, fileName, fileSize, containerId };
  }

  static createValidationErrorResponse(message: string) {
    return NextResponse.json({ error: message }, { status: 400 });
  }

  static createJsonResponse(data: any, status: number = 200) {
    return NextResponse.json(data, { status });
  }

  static generateFileKey(userId: string, containerId: string, fileType: string) {
    const extension = fileType.split('/')[1];
    return `${userId}/${containerId}/${randomUUID()}.${extension}`;
  }
}

export async function GET(req: NextRequest) {
  return await FileController.handleRequest(req);
}
