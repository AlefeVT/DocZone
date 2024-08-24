import { currentUser } from '@/lib/auth';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { s3Client } from '../s3client-config';
import { PrismaClient } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileType = searchParams.get('fileType');
  const fileName = searchParams.get('fileName');

  const user = await currentUser();

  if (!fileType || typeof fileType !== 'string') {
    return NextResponse.json(
      { error: 'fileType is required and must be a string' },
      { status: 400 }
    );
  }

  if (!fileName || typeof fileName !== 'string') {
    return NextResponse.json(
      { error: 'fileName is required and must be a string' },
      { status: 400 }
    );
  }

  if (!user || !user.id) {
    redirect('/auth/login');
  }

  const extension = fileType.split('/')[1];
  const key = `${user.id}/${randomUUID()}.${extension}`;

  const s3Params = {
    Bucket: process.env.BUCKET_S3!,
    Key: key,
    ContentType: fileType,
  };

  try {
    const command = new PutObjectCommand(s3Params);
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    const prisma = new PrismaClient();

    const file = await prisma.file.create({
      data: {
        userId: user.id,
        key: key,
        fileName: fileName, // Usando o nome customizado do arquivo
        fileType: fileType,
      },
    });

    return NextResponse.json({
      uploadUrl,
      key: key,
    });
  } catch (error) {
    console.error(
      'Error generating signed URL or saving file metadata:',
      error
    );
    return NextResponse.json(
      { error: 'Failed to generate signed URL or save file metadata' },
      { status: 500 }
    );
  }
}
